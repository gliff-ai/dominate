import { ReactElement, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Curate from "@gliff-ai/curate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase } from "@/etebase";
import { Slices, MetaItem } from "@/etebase/interfaces";
import { Task } from "@/components";

import {
  stringifySlices,
  getImageMetaFromImageFileInfo,
} from "@/imageConversions";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  etebaseInstance: DominateEtebase;
  setTask: (task: Task) => void;
}

export const CurateWrapper = (props: Props): ReactElement | null => {
  if (!props.etebaseInstance) return null;

  const [curateInput, setCurateInput] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const { id: galleryUidParam } = useParams(); // uid of selected gallery, from URL ( === galleryItems[something].uid)
  const [galleryUid, setGalleryUid] = useState<string>(galleryUidParam);

  const navigate = useNavigate();

  const auth = useAuth();

  const fetchImageItems = (): void => {
    // fetches images via DominateEtebase, and assigns them to imageItems state
    props.etebaseInstance
      .getImagesMeta(galleryUid)
      .then((items) => {
        // discard imageUID, annotationUID and auditUID, and unpack item.metadata:
        const wrangled = items.map(
          ({ thumbnail, imageLabels, id, metadata }) => ({
            thumbnail,
            imageLabels,
            id,
            ...metadata,
          })
        );

        setCurateInput(wrangled);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchGalleries = (): void => {
    // fetches galleries via DominateEtebase, and assigns them to galleryItems state
    props.etebaseInstance
      .getCollectionsMeta("gliff.gallery")
      .then((items) => {
        // If galleryUid isn't set, use the first gallery
        if (items.length > 0 && !galleryUid) {
          setGalleryUid(items[0].uid);
        } else {
          // Create the user a default collection?
          console.warn("User doesn't have any collections!");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const addImageToGallery = async (
    imageFileInfo: ImageFileInfo,
    slicesData: Slices
  ): Promise<void> => {
    // Stringify slices data and get image metadata
    const stringfiedSlices = stringifySlices(slicesData);
    const imageMeta = getImageMetaFromImageFileInfo(imageFileInfo);

    // make thumbnail:
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(slicesData[0][0], 0, 0, 128, 128);
    const thumbnailB64 = canvas.toDataURL();

    // Store slices inside a new gliff.image item and add the metadata/thumbnail to the selected gallery
    await props.etebaseInstance.createImage(
      galleryUid,
      imageMeta,
      thumbnailB64,
      stringfiedSlices
    );

    fetchImageItems();
  };

  const saveLabelsCallback = (imageUid: string, newLabels: string[]): void => {
    props.etebaseInstance
      .setImageLabels(galleryUid, imageUid, newLabels)
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteImageCallback = (imageUids: string[]): void => {
    props.etebaseInstance.deleteImages(galleryUid, imageUids).catch((error) => {
      console.log(error);
    });
  };

  const annotateCallback = (imageUid: string): void => {
    navigate(`/annotate/${galleryUid}/${imageUid}`);
  };

  // runs once on page load, would have been a componentDidMount if this were a class component:
  useEffect(() => {
    if (props.etebaseInstance.ready) {
      fetchGalleries();
    }
  }, [props.etebaseInstance.ready]);

  useEffect(() => {
    if (galleryUid) {
      fetchImageItems();
    }
  }, [galleryUid]);

  if (!props.etebaseInstance || !auth.user || !galleryUid) return null;

  return (
    <Curate
      metadata={curateInput}
      saveImageCallback={addImageToGallery}
      saveLabelsCallback={saveLabelsCallback}
      deleteImagesCallback={deleteImageCallback}
      annotateCallback={annotateCallback}
      showAppBar={false}
      setTask={props.setTask}
    />
  );
};
