import React, { ReactElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase } from "@/etebase";
import {
  Slices,
  GalleryMeta,
  Image,
  MetaItem,
  GalleryTile,
} from "@/etebase/interfaces";
import Curate from "@gliff-ai/curate";

import {
  stringifySlices,
  getImageMetaFromImageFileInfo,
} from "@/imageConversions";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const CurateWrapper = (props: Props): ReactElement | null => {
  if (!props.etebaseInstance) return null;
  const [galleryItems, setGalleryItems] = useState<GalleryMeta[]>([]); // the objects we list under "Collections"
  const [imageItems, setImageItems] = useState<Image[]>([]); // the objects we list under "Items"
  const [galleryTiles, setGalleryTiles] = useState<GalleryTile[]>([]); // the information a gallery stores about its contents
  const [curateInput, setCurateInput] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const { id: galleryUid } = useParams(); // uid of selected gallery, from URL ( === galleryItems[something].uid)

  const auth = useAuth();

  const fetchImageItems = (): void => {
    // fetches images via DominateEtebase, and assigns them to imageItems state
    props.etebaseInstance
      .getImagesMeta(galleryUid)
      .then((items) => {
        // set galleryTiles so that etebase pointers are kept:
        setGalleryTiles(items);

        // discard imageUID, annotationUID and auditUID, and unpack item.metadata:
        const wrangled = items.map((item) => ({
          thumbnail: item.thumbnail,
          imageLabels: item.imageLabels,
          id: item.id,
          ...item.metadata,
        }));

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
        setGalleryItems(items);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createGalleryCollection = (): void => {
    // Create new gallery collection.
    props.etebaseInstance
      .createCollection(`gallery-${galleryItems.length + 1}`)
      .then(() => {
        // Fetch gallery items
        fetchGalleries();
      })
      .catch((e) => console.log(e));
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

  if (!props.etebaseInstance || !auth.user) return null;

  return galleryUid ? (
    <Curate
      metadata={curateInput}
      saveImageCallback={addImageToGallery}
      saveLabelsCallback={saveLabelsCallback}
    />
  ) : (
    <>
      <div style={{ display: "flex" }}>
        <button
          onClick={createGalleryCollection}
          type="button"
          style={{ marginRight: 10 }}
        >
          New Gallery
        </button>
        <UploadImage
          setUploadedImage={addImageToGallery}
          spanElement={<span>Add image</span>}
          multiple={false}
        />
      </div>
      <h3>Collections:</h3>
      {galleryItems
        ? galleryItems.map((item) => (
            <React.Fragment key={item.uid}>
              <span>
                <Link to={`/curate/${item.uid}`}>{item.name}</Link>
              </span>
              <br />
            </React.Fragment>
          ))
        : null}

      <h3>Items</h3>
      {imageItems
        ? imageItems.map((item) => (
            <React.Fragment key={item.uid}>
              <span>
                <Link to={`/annotate/${galleryUid}/${item.uid}`}>
                  {item.uid}
                </Link>
              </span>
              <br />
            </React.Fragment>
          ))
        : null}
    </>
  );
};
