import {
  ReactElement,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

import Curate from "@gliff-ai/curate";
import { Task } from "@gliff-ai/style";

import { ImageFileInfo } from "@gliff-ai/upload";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Annotations, getTiffData } from "@gliff-ai/annotate";
import { DominateStore } from "@/store";
import { GalleryTile, Slices, MetaItem } from "@/interfaces";
import {
  ConfirmationDialog,
  MessageDialog,
} from "@/components/message/ConfirmationDialog";

import { stringifySlices, mixBase64Channels } from "@/imageConversions";
import { useAuth } from "@/hooks/use-auth";
import { useStore, usePlugins } from "@/hooks";
import {
  uniquifyFilenames,
  makeAnnotationsJson,
  convertGalleryToMetadata,
  convertMetadataToGalleryTiles,
  MetaItemWithId,
} from "@/helpers";
import { Product } from "@/plugins";
import { UserAccess } from "@/services/user";
import { getTeam, Profile } from "@/services/team";

const logger = console;
interface Props {
  storeInstance: DominateStore;
  setIsLoading: (isLoading: boolean) => void;
  task: Task;
  setTask: (task: Task) => void;
}

export const CurateWrapper = ({
  storeInstance,
  setIsLoading,
  task,
  setTask,
}: Props): ReactElement | null => {
  const navigate = useNavigate();
  const auth = useAuth();

  const { collectionUid = "" } = useParams<string>(); // uid of selected gallery, from URL
  const [metadata, setMetadata] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const [defaultLabels, setDefaultLabels] = useState<string[]>([]); // more input for curate
  const [restrictLabels, setRestrictLabels] = useState<boolean>(false); // more input for curate
  const [multiLabel, setMultiLabel] = useState<boolean>(true); // more input for curate
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
  const plugins = usePlugins(collectionUid, auth, Product.CURATE);
  const isMounted = useRef(false);

  const isOwnerOrMember = useMemo(
    () =>
      auth?.userAccess !== null
        ? auth?.userAccess === UserAccess.Owner ||
          auth?.userAccess === UserAccess.Member
        : null,
    [auth?.userAccess]
  );

  const fetchImageItems = useStore(
    storeInstance,
    () => {
      // doesn't actually fetch image items, fetches gallery collection content
      // fetches images via DominateStore, and assigns them to imageItems state

      if (!auth?.user?.username || !collectionUid || isOwnerOrMember === null)
        return;

      void storeInstance
        .getImagesMeta(collectionUid)
        .then(({ tiles: gallery, galleryMeta }) => {
          setCollectionContent(gallery);

          let newMetadata = convertGalleryToMetadata(gallery);
          // if user is collaborator, include only images assigned to them.
          newMetadata = newMetadata.filter(
            ({ assignees }) =>
              isOwnerOrMember ||
              (assignees as string[]).includes(auth?.user?.username as string)
          );
          setMetadata(newMetadata);

          setDefaultLabels(galleryMeta.defaultLabels);
          setRestrictLabels(galleryMeta.restrictLabels);
          setMultiLabel(galleryMeta.multiLabel);
        })
        .catch((err) => logger.log(err));
    },
    [auth?.user?.username, collectionUid, isOwnerOrMember]
  );

  const addImagesToGallery = async (
    imageFileInfo: ImageFileInfo[],
    slicesData: Slices[]
  ): Promise<void> => {
    const thumbnails: string[] = [];
    const stringifiedSlices: string[] = [];

    setTask({ ...task, progress: 0 });

    for (let i = 0; i < imageFileInfo.length; i += 1) {
      // Stringify slices data and get image metadata
      stringifiedSlices.push(stringifySlices(slicesData[i]));

      // make thumbnail:
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalCompositeOperation = "lighter";
        slicesData[i][0].forEach((channel) => {
          ctx.drawImage(channel, 0, 0, 128, 128);
        });
        thumbnails.push(canvas.toDataURL());
      }
    }

    setTask({ ...task, progress: 10 });

    // Store slices inside a new gliff.image item and add the metadata/thumbnail to the selected gallery
    await storeInstance
      .createImage(
        collectionUid,
        imageFileInfo,
        thumbnails,
        stringifiedSlices,
        setTask
      )
      .then((newTiles) => {
        if (newTiles) {
          setMetadata(metadata.concat(convertGalleryToMetadata(newTiles)));
          setCollectionContent(collectionContent.concat(newTiles));
        }
      })
      .catch((err) => logger.error(err));
  };

  const saveLabelsCallback = (imageUid: string, newLabels: string[]): void => {
    storeInstance
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
    storeInstance
      .updateGalleryMeta(collectionUid, {
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
    storeInstance
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
    storeInstance
      .deleteImages(collectionUid, imageUids, task, setTask)
      .then(() => {
        fetchImageItems();
      })
      .catch((error) => {
        logger.log(error);
      });
  };

  const annotateCallback = (
    imageUid: string,
    username: string | null = null
  ): void => {
    if (username) {
      const annotationUid = collectionContent.find(
        (tile) => tile.imageUID === imageUid
      )?.annotationUID[username];
      if (annotationUid) {
        navigate(`/annotate/${collectionUid}/${imageUid}/${annotationUid}`);
      }
    } else {
      navigate(`/annotate/${collectionUid}/${imageUid}`);
    }
  };

  const downloadDataset = async (): Promise<void> => {
    const zip = new JSZip();

    setTask({
      description: "Downloading data...",
      isLoading: true,
      progress: 10,
    });
    const imagePromises = storeInstance.getAllImages(collectionUid, setTask);
    const annotationPromises =
      storeInstance.getAllAnnotationsObjects(collectionUid);
    const [images, { annotations }] = await Promise.all([
      imagePromises,
      annotationPromises,
    ]);

    setTask({
      description: "Writing annotation data...",
      isLoading: true,
      progress: 60,
    });

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

    setTask({
      description: "Writing images...",
      isLoading: true,
      progress: 70,
    });

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
                mixBase64Channels(
                  (JSON.parse(images[i].content) as string[][])[0]
                ),
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
      setTask({
        description: "Generating label images...",
        isLoading: true,
        progress: 75,
      });
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

    setTask({
      description: "Compressing data...",
      isLoading: true,
      progress: 85,
    });

    // compress data and save to disk:
    const date = new Date();
    const projectName = await storeInstance
      .getCollectionMeta(collectionUid)
      .then((collection) => collection.name)
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
        setTask({
          description: "Download complete",
          isLoading: true,
          progress: 100,
        });
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

  const saveMetadataCallback = useCallback(
    (data: { collectionUid: string; metadata: MetaItemWithId[] }) => {
      const newTiles = convertMetadataToGalleryTiles(data.metadata);
      void storeInstance
        .updateGallery(data.collectionUid, newTiles)
        .then(() => fetchImageItems())
        .catch((error) => console.error(error));
    },
    [storeInstance, fetchImageItems]
  );

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    setIsLoading(true);
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, [setIsLoading]);

  useEffect(() => {
    // get profiles (should run once at mount)
    if (!auth?.userProfileReady || !isOwnerOrMember) return;

    getTeam()
      .then((team) => {
        const newProfiles = team.profiles
          .filter(({ is_trusted_service }) => !is_trusted_service)
          .map(({ id, email, name, is_collaborator }) => {
            let access = UserAccess.Collaborator;
            if (id === team?.owner.id) {
              access = UserAccess.Owner;
            } else if (!is_collaborator) {
              access = UserAccess.Member;
            }
            return {
              email,
              name,
              access,
            };
          }) as Profile[];

        if (newProfiles.length !== 0) {
          setProfiles(newProfiles);
        }
      })
      .catch((e) => logger.error(e));
  }, [auth?.userProfileReady, isOwnerOrMember]);

  useEffect(() => {
    // get image thumbnails and metadata (should run once at mount)
    fetchImageItems();
  }, [fetchImageItems]);

  if (
    !storeInstance ||
    !auth?.user ||
    !collectionUid ||
    auth?.userAccess === null
  )
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
        setIsLoading={setIsLoading}
        setTask={setTask}
        profiles={profiles}
        userAccess={auth.userAccess}
        plugins={plugins}
        launchPluginSettingsCallback={
          Number(auth?.userProfile?.team?.tier?.id) > 1 && isOwnerOrMember
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
