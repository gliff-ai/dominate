import { ReactElement, useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Curate from "@gliff-ai/curate";
import { Task } from "@gliff-ai/style";

import { ImageFileInfo } from "@gliff-ai/upload";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Annotations, getTiffData } from "@gliff-ai/annotate";
import { DominateStore } from "@/store";
import { Slices, MetaItem, GalleryTile } from "@/store/interfaces";
import {
  ConfirmationDialog,
  MessageDialog,
} from "@/components/message/ConfirmationDialog";

import { stringifySlices } from "@/imageConversions";
import { useAuth, UserAccess } from "@/hooks/use-auth";
import { useMountEffect } from "@/hooks/use-mountEffect";
import { useStore } from "@/hooks/use-store";
import { apiRequest } from "@/api";
import {
  setStateIfMounted,
  uniquifyFilenames,
  makeAnnotationsJson,
  convertGalleryToMetadata,
  convertMetadataToGalleryTiles,
  MetaItemWithId,
} from "@/helpers";

import { initPluginObjects, PluginObject, Product } from "@/plugins";

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

interface Props {
  storeInstance: DominateStore;
  setIsLoading: (isLoading: boolean) => void;
  task: Task;
  setTask: (task: Task) => void;
}

export const CurateWrapper = (props: Props): ReactElement | null => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [metadata, setMetadata] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const [defaultLabels, setDefaultLabels] = useState<string[]>([]); // more input for curate
  const [restrictLabels, setRestrictLabels] = useState<boolean>(false); // more input for curate
  const [multiLabel, setMultiLabel] = useState<boolean>(true); // more input for curate
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
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  const [plugins, setPlugins] = useState<PluginObject | null>(null);
  const isMounted = useRef(false);

  const isOwnerOrMember = useCallback(
    () =>
      auth?.userAccess === UserAccess.Owner ||
      auth?.userAccess === UserAccess.Member,
    [auth]
  );

  const fetchImageItems = useStore(
    // doesn't actually fetch image items, fetches gallery collection content
    props,
    (storeInstance) => {
      // fetches images via DominateStore, and assigns them to imageItems state
      if (!auth?.user?.username) return;

      storeInstance
        .getImagesMeta(collectionUid, auth?.user.username)
        .then((items) => {
          const { tiles: gallery, galleryMeta } = items;
          setStateIfMounted(gallery, setCollectionContent, isMounted.current);

          const newMetadata = convertGalleryToMetadata(gallery);

          // if user is collaborator, include only images assigned to them.
          const canViewAllImages = isOwnerOrMember();
          newMetadata.filter(
            ({ assignees }) =>
              canViewAllImages ||
              (assignees as string[]).includes(auth?.user?.username as string)
          );

          setMetadata(newMetadata);
          setDefaultLabels(galleryMeta.defaultLabels);
          setRestrictLabels(galleryMeta.restrictLabels);
          setMultiLabel(galleryMeta.multiLabel);
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
    const thumbnails: string[] = [];
    const stringifiedSlices: string[] = [];

    props.setTask({ ...props.task, progress: 0 });

    for (let i = 0; i < imageFileInfo.length; i += 1) {
      // Stringify slices data and get image metadata
      stringifiedSlices.push(stringifySlices(slicesData[i]));

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
      imageFileInfo,
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

  const saveDefaultLabelsCallback = (
    newDefaultLabels: string[],
    newRestrictLabels: boolean,
    newMultiLabel: boolean
  ) => {
    props.storeInstance
      .updateCollectionMeta(collectionUid, {
        defaultLabels: newDefaultLabels,
        restrictLabels: newRestrictLabels,
        multiLabel: newMultiLabel,
      })
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

    const images = await props.storeInstance.getAllImages(collectionUid);
    const { meta: annotationsMeta, annotations } =
      await props.storeInstance.getAllAnnotationsObjects(collectionUid);

    let allnames: string[] = collectionContent.map(
      (tile) => tile.fileInfo.fileName
    );

    // append " (n)" to file names when multiple files have the same name
    // or else JSZip will treat them as a single image:
    allnames = uniquifyFilenames(allnames);
    const jsonString = makeAnnotationsJson(
      allnames,
      collectionContent,
      annotations
    );
    // add JSON to zip:
    zip.file("annotations.json", jsonString);

    // make images directory:
    const imagesFolder = zip.folder("images") as JSZip;

    if (multi) {
      // put all images in the root of images directory:
      for (let i = 0; i < images.length; i += 1) {
        imagesFolder.file(allnames[i], images[i].content, { base64: true });
      }
    } else {
      // get set of all labels:
      const allLabels = new Set<string>(
        collectionContent.map((tile) => tile.imageLabels).flat()
      );

      // add label folders to zip:
      for (const label of allLabels) {
        const labelFolder = imagesFolder.folder(label);
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
      if (
        collectionContent.filter((tile) => tile.imageLabels.length === 0)
          .length > 0
      ) {
        const unlabelledFolder = imagesFolder.folder("unlabelled");

        if (unlabelledFolder) {
          for (let i = 0; i < images.length; i += 1) {
            if (collectionContent[i].imageLabels.length === 0) {
              unlabelledFolder.file(
                collectionContent[i].fileInfo.fileName,
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

    if (
      annotations
        .flat(2)
        .filter((annotation) => annotation.brushStrokes.length > 0).length > 0
    ) {
      // create tiff label images (one for each annotator for this image):

      const maskFolder = zip.folder("masks") as JSZip;

      annotations.forEach((userAnnotations, i) => {
        userAnnotations.forEach((annotationsObject, j) => {
          if (
            annotationsObject.filter(
              (annotation) => annotation.brushStrokes.length > 0
            ).length > 0 // are there any brushstrokes in this annotationsObject?
          ) {
            let maskName = allnames[i].split(".")[0];
            if (userAnnotations.length > 1) {
              maskName += `_${j}`;
            }
            maskName += ".tiff";

            maskFolder.file(
              maskName,
              getTiffData(new Annotations(annotationsObject), {
                ...images[i].meta.fileInfo,
                fileName: maskName,
              })
            );
          }
        });
      });
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

  const getProfiles = useCallback((): void => {
    if (
      !auth?.ready ||
      auth?.userAccess === UserAccess.Collaborator ||
      profiles
    )
      return;

    void apiRequest("/team/", "GET")
      .then((team: Team) => {
        const newProfiles = team.profiles
          .filter(({ is_trusted_service }) => !is_trusted_service)
          .map(({ email, name }) => ({
            email,
            name,
          }));
        if (newProfiles.length !== 0) {
          setStateIfMounted(newProfiles, setProfiles, isMounted.current);
        }
      })
      .catch((e) => logger.error(e));
  }, [auth, profiles]);

  const fetchPlugins = useCallback(async () => {
    if (!auth?.user || collectionUid === "") return;
    try {
      const newPlugins = await initPluginObjects(
        Product.CURATE,
        collectionUid,
        auth?.user.username as string
      );
      if (newPlugins) {
        setStateIfMounted(newPlugins, setPlugins, isMounted.current);
      }
    } catch (e) {
      console.error(e);
    }
  }, [auth, collectionUid, isMounted]);

  const saveMetadataCallback = useCallback(
    (data: { collectionUid: string; metadata: MetaItemWithId[] }) => {
      const newTiles = convertMetadataToGalleryTiles(data.metadata);
      void props.storeInstance
        .updateGallery(data.collectionUid, newTiles)
        .then(() => fetchImageItems())
        .catch((error) => console.error(error));
    },
    [props.storeInstance, fetchImageItems]
  );

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    getProfiles();
  }, [getProfiles]);

  useEffect(() => {
    if (!collectionUid) return;
    fetchImageItems();
  }, [collectionUid, fetchImageItems, isMounted, auth]);

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  if (!props.storeInstance || !auth?.user || !collectionUid || !auth.userAccess)
    return null;

  return (
    <>
      <Curate
        metadata={metadata}
        defaultLabels={defaultLabels}
        restrictLabels={restrictLabels}
        multiLabel={multiLabel}
        saveImageCallback={addImagesToGallery}
        saveLabelsCallback={saveLabelsCallback}
        saveDefaultLabelsCallback={saveDefaultLabelsCallback}
        saveAssigneesCallback={saveAssigneesCallback}
        deleteImagesCallback={deleteImagesCallback}
        annotateCallback={annotateCallback}
        downloadDatasetCallback={downloadDatasetCallback}
        updateImagesCallback={fetchImageItems}
        showAppBar={false}
        setIsLoading={props.setIsLoading}
        setTask={props.setTask}
        profiles={profiles}
        userAccess={auth.userAccess}
        plugins={plugins}
        launchPluginSettingsCallback={
          Number(auth?.userProfile?.team?.tier?.id) > 1 && isOwnerOrMember()
            ? () => navigate(`/manage/plugins`)
            : null
        }
        saveMetadataCallback={saveMetadataCallback}
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
