import { ReactElement, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Curate from "@gliff-ai/curate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { DominateStore } from "@/store";
import {
  Slices,
  MetaItem,
  GalleryTile,
  Image,
  ImageMeta,
} from "@/store/interfaces";
import { Task, TSButtonToolbar } from "@/components";
import {
  ConfirmationDialog,
  MessageDialog,
} from "@/components/message/ConfirmationDialog";
import { Plugins } from "@/plugins/Plugins";
import { usePlugins } from "@/hooks";

import {
  stringifySlices,
  getImageMetaFromImageFileInfo,
} from "@/imageConversions";
import { useAuth } from "@/hooks/use-auth";
import { useMountEffect } from "@/hooks/use-mountEffect";
import { useStore } from "@/hooks/use-store";
import { apiRequest } from "@/api";
import { setStateIfMounted } from "@/helpers";

const logger = console;

// NOTE: Profile and Team are taken from MANAGE
interface Profile {
  email: string;
  name: string;
  is_collaborator: boolean;
  is_trusted_service: boolean;
}

interface Team {
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
    is_collaborator: boolean;
  }>;
}

type Collaborator = { name: string; email: string };

interface Props {
  storeInstance: DominateStore;
  setIsLoading: (isLoading: boolean) => void;
  task: Task;
  setTask: (task: Task) => void;
}

export const CurateWrapper = (props: Props): ReactElement | null => {
  const navigate = useNavigate();
  const auth = useAuth();
  const plugins = usePlugins();

  const [curateInput, setCurateInput] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const { collectionUid = "" } = useParams<string>(); // uid of selected gallery, from URL
  const [collectionContent, setCollectionContent] = useState<GalleryTile[]>([]);

  // multi-label image download dialog state:
  const [showMultilabelConfirm, setShowMultilabelConfirm] =
    useState<boolean>(false);
  const [multi, setMulti] = useState<boolean>(false);

  // image deletion dialog state:
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // no images to download message state:
  const [showNoImageMessage, setShowNoImageMessage] = useState<boolean>(false);

  const [pluginUrls, setPluginUrls] = useState<string[] | null>(null);
  const [collaborators, setCollaborators] =
    useState<Collaborator[] | null>(null);
  const isMounted = useRef(false);

  const fetchImageItems = useStore(
    props,
    (storeInstance) => {
      // fetches images via DominateStore, and assigns them to imageItems state
      if (!auth?.user?.username) return;
      storeInstance
        .getImagesMeta(collectionUid, auth?.user.username)
        .then((items) => {
          setStateIfMounted(items, setCollectionContent, isMounted.current);
          // discard imageUID, annotationUID and auditUID, and unpack item.metadata:
          const wrangled = items
            .map(
              ({
                thumbnail,
                imageLabels = [],
                assignees = [],
                id,
                metadata,
              }) => ({
                thumbnail,
                imageLabels,
                id,
                ...metadata,
                assignees,
              })
            )
            .filter(
              ({ assignees }) =>
                // If user is not an owner, include only images assigned to them
                auth?.isOwner ||
                assignees.includes(auth?.user?.username as string)
            );

          setCurateInput(wrangled);
        })
        .catch((err) => {
          logger.log(err);
        });
    },
    [collectionUid]
  );

  const addImagesToGallery = async (
    imageFileInfo: ImageFileInfo[],
    slicesData: Slices[]
  ): Promise<void> => {
    const imageMetas: ImageMeta[] = [];
    const thumbnails: string[] = [];
    const stringifiedSlices: string[] = [];

    props.setTask({ ...props.task, progress: 0 });

    for (let i = 0; i < imageFileInfo.length; i += 1) {
      // Stringify slices data and get image metadata
      stringifiedSlices.push(stringifySlices(slicesData[i]));
      imageMetas.push(getImageMetaFromImageFileInfo(imageFileInfo[i]));

      // make thumbnail:
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(slicesData[i][0][0], 0, 0, 128, 128);
        thumbnails.push(canvas.toDataURL());
      }
    }

    props.setTask({ ...props.task, progress: 10 });

    // Store slices inside a new gliff.image item and add the metadata/thumbnail to the selected gallery
    await props.storeInstance.createImage(
      collectionUid,
      imageMetas,
      thumbnails,
      stringifiedSlices,
      props.task,
      props.setTask
    );

    fetchImageItems();
  };

  const saveLabelsCallback = (imageUid: string, newLabels: string[]): void => {
    props.storeInstance
      .setImageLabels(collectionUid, imageUid, newLabels)
      .then(fetchImageItems)
      .catch((error) => {
        logger.log(error);
      });
  };

  const saveAssigneesCallback = (
    imageUids: string[],
    newAssignees: string[][]
  ): void => {
    props.storeInstance
      .setAssignees(collectionUid, imageUids, newAssignees)
      .then(fetchImageItems)
      .catch((error) => {
        logger.log(error);
      });
  };

  const deleteImagesCallback = (imageUids: string[]): void => {
    setImagesToDelete(imageUids);
    setShowDeleteConfirm(true);
  };

  const deleteImages = (imageUids: string[]): void => {
    props.storeInstance
      .deleteImages(collectionUid, imageUids, props.task, props.setTask)
      .then(() => {
        fetchImageItems();
      })
      .catch((error) => {
        logger.log(error);
      });
  };

  const annotateCallback = (imageUid: string): void => {
    navigate(`/annotate/${collectionUid}/${imageUid}`);
  };

  const downloadDataset = async (): Promise<void> => {
    const zip = new JSZip();

    // retrieve Image items and their names from store:
    // TODO: store image names in Image items!
    const imagePromises: Promise<Image>[] = [];
    const imageNames: string[] = [];
    for (const tile of collectionContent) {
      const imageUid = tile.imageUID;
      imagePromises.push(props.storeInstance.getImage(collectionUid, imageUid));
      imageNames.push(tile.metadata.imageName);
    }
    const images: Image[] = await Promise.all(imagePromises);

    // append " (n)" to image names when multiple images have the same name,
    // or else JSZip will treat them as a single image:
    const allnames: string[] = collectionContent.map(
      (tile) => tile.metadata.imageName
    );
    const counts = {};
    for (let i = 0; i < allnames.length; i += 1) {
      if (counts[allnames[i]] > 0) {
        allnames[i] += ` (${counts[allnames[i]] as number})`;
      }
      if (counts[allnames[i]] === undefined) {
        counts[allnames[i]] = 1;
      } else {
        counts[allnames[i]] += 1;
      }
    }

    if (multi) {
      // put them all in the root of the zip along with a JSON file describing labels:
      type JSONImage = { name: string; labels: string[] };
      const json: JSONImage[] = allnames.map((name, i) => ({
        name,
        labels: collectionContent[i].imageLabels,
      }));

      const jsonString = JSON.stringify(json);

      // add JSON and all images to zip:
      zip.file("labels.json", jsonString);
      for (let i = 0; i < images.length; i += 1) {
        zip.file(allnames[i], images[i].content, { base64: true });
      }
    } else {
      // get set of all labels:
      const allLabels = new Set<string>(
        collectionContent.map((tile) => tile.imageLabels).flat()
      );

      // add label folders to zip:
      for (const label of allLabels) {
        const labelFolder = zip.folder(label);
        if (labelFolder) {
          // add images to label folder in zip:
          for (let i = 0; i < images.length; i += 1) {
            if (collectionContent[i].imageLabels.includes(label)) {
              labelFolder.file(allnames[i], images[i].content, {
                base64: true,
              });
            }
          }
        }
      }

      // put unlabelled images in their own folder:
      if (collectionContent.filter((tile) => tile.imageLabels.length === 0)) {
        const unlabelledFolder = zip.folder("unlabelled");

        if (unlabelledFolder) {
          for (let i = 0; i < images.length; i += 1) {
            if (collectionContent[i].imageLabels.length === 0) {
              unlabelledFolder.file(
                collectionContent[i].metadata.imageName,
                images[i].content,
                {
                  base64: true,
                }
              );
            }
          }
        }
      }
    }

    // compress data and save to disk:
    const date = new Date();
    const projectName = await props.storeInstance
      .getCollectionsMeta()
      .then(
        (collections) =>
          collections.filter((c) => c.uid === collectionUid)[0].name
      )
      .catch((err) => {
        logger.log(err);
        return "";
      });
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);

    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        (saveAs as (Blob, string) => void)(
          content,
          `${date.getFullYear()}${month}${day}_${hours}${minutes}_${projectName}.zip`
        );
      })
      .catch((err) => {
        logger.log(err);
      });
  };

  const downloadDatasetCallback = (): void => {
    // check the collection has images:
    if (collectionContent.length === 0) {
      setShowNoImageMessage(true);
      return;
    }

    // check for multi-labelled images:
    for (const tile of collectionContent) {
      if (tile.imageLabels.length > 1) {
        setMulti(true);
        setShowMultilabelConfirm(true);
        return;
      }
    }
    setMulti(false);
    void downloadDataset();
  };

  useMountEffect(() => {
    props.setIsLoading(true);
  });

  const getCollaborators = (): void => {
    if (auth?.isOwner) return;
    void apiRequest("/team/", "GET")
      .then((team: Team) => {
        const newCollaborators = team.profiles
          .filter(({ is_collaborator }) => is_collaborator)
          .map(({ name, email }) => ({ name, email }));
        if (newCollaborators.length !== 0) {
          setStateIfMounted(
            newCollaborators,
            setCollaborators,
            isMounted.current
          );
        }
      })
      .catch((e) => logger.error(e));
  };

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!auth?.ready || collaborators) return;
    getCollaborators();
  }, [auth, collaborators, isMounted]);

  useEffect(() => {
    if (!collectionUid) return;
    fetchImageItems();
  }, [collectionUid, fetchImageItems, isMounted, auth]);

  useEffect(() => {
    if (plugins === null || !plugins?.plugins || pluginUrls) return;

    const urls = plugins.plugins
      .filter(({ product }) => product === "CURATE")
      .map(({ url }) => url);

    if (urls.length !== 0) {
      setStateIfMounted(urls, setPluginUrls, isMounted.current);
    }
  }, [plugins, pluginUrls, isMounted]);

  if (!props.storeInstance || !auth?.user || !collectionUid) return null;
  return (
    <>
      <Curate
        metadata={curateInput}
        saveImageCallback={addImagesToGallery}
        saveLabelsCallback={saveLabelsCallback}
        saveAssigneesCallback={saveAssigneesCallback}
        deleteImagesCallback={deleteImagesCallback}
        annotateCallback={annotateCallback}
        downloadDatasetCallback={downloadDatasetCallback}
        showAppBar={false}
        setIsLoading={props.setIsLoading}
        setTask={props.setTask}
        trustedServiceButtonToolbar={(imageUid: string, enabled: boolean) => (
          <TSButtonToolbar
            collectionUid={collectionUid}
            imageUid={imageUid}
            tooltipPlacement="top"
            enabled={enabled}
            callback={fetchImageItems}
          />
        )}
        plugins={
          pluginUrls ? (
            <Plugins plugins={pluginUrls} metadata={curateInput} />
          ) : null
        }
        collaborators={collaborators}
        userIsOwner={auth.isOwner}
      />

      <ConfirmationDialog
        open={showMultilabelConfirm}
        setOpen={setShowMultilabelConfirm}
        heading="Warning"
        message="Dataset contains multilabel images, this will export as a flat directory with a JSON file for labels. Continue?"
        okCallback={downloadDataset}
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        setOpen={setShowDeleteConfirm}
        heading="Warning"
        message={`Delete ${imagesToDelete.length} images?`}
        okCallback={() => {
          deleteImages(imagesToDelete);
        }}
      />

      <MessageDialog
        open={showNoImageMessage}
        setOpen={setShowNoImageMessage}
        heading="Warning"
        message="There are no images to download!"
      />
    </>
  );
};
