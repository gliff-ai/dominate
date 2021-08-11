import { ReactElement, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Dialog,
  Button,
  Typography,
  Card,
  Paper,
  makeStyles,
  Theme,
  DialogActions,
} from "@material-ui/core";

import Curate from "@gliff-ai/curate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { DominateEtebase } from "@/etebase";
import { Slices, MetaItem, GalleryTile, Image } from "@/etebase/interfaces";
import { Task } from "@/components";

import {
  stringifySlices,
  getImageMetaFromImageFileInfo,
} from "@/imageConversions";
import { useAuth } from "@/hooks/use-auth";

const useStyles = () =>
  makeStyles((theme: Theme) => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
    projectsTypography: {
      color: "#000000",
      display: "inline",
      fontSize: "21px",
      marginRight: "125px",
    },
  }));

interface Props {
  etebaseInstance: DominateEtebase;
  setIsLoading: (isLoading: boolean) => void;
  setTask: (task: Task) => void;
}

export const CurateWrapper = (props: Props): ReactElement | null => {
  if (!props.etebaseInstance) return null;
  const navigate = useNavigate();
  const auth = useAuth();

  const [curateInput, setCurateInput] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const { collectionUid } = useParams(); // uid of selected gallery, from URL ( === galleryItems[something].uid)
  const [collectionContent, setCollectionContent] = useState<GalleryTile[]>([]);
  const [multi, setMulti] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    props.setIsLoading(true);
  }, []);

  const fetchImageItems = (): void => {
    // fetches images via DominateEtebase, and assigns them to imageItems state
    props.etebaseInstance
      .getImagesMeta(collectionUid)
      .then((items) => {
        setCollectionContent(items);
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
    props.etebaseInstance.getCollectionsMeta("gliff.gallery").catch((err) => {
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
      collectionUid,
      imageMeta,
      thumbnailB64,
      stringfiedSlices
    );

    fetchImageItems();
  };

  const saveLabelsCallback = (imageUid: string, newLabels: string[]): void => {
    props.etebaseInstance
      .setImageLabels(collectionUid, imageUid, newLabels)
      .then(fetchImageItems)
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteImageCallback = (imageUids: string[]): void => {
    props.etebaseInstance
      .deleteImages(collectionUid, imageUids)
      .catch((error) => {
        console.log(error);
      });
  };

  const annotateCallback = (imageUid: string): void => {
    navigate(`/annotate/${collectionUid}/${imageUid}`);
  };

  const downloadDataset = async (): Promise<void> => {
    const zip = new JSZip();

    // retrieve Image items and their names from etebase:
    // TODO: store image names in Image items!
    const imagePromises: Promise<Image>[] = [];
    const imageNames: string[] = [];
    for (const tile of collectionContent) {
      const imageUid = tile.imageUID;
      imagePromises.push(
        props.etebaseInstance.getImage(collectionUid, imageUid)
      );
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

    console.log(multi);
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
        collectionContent
          .map((tile) => tile.imageLabels)
          .reduce((acc: string[], thisLabels: string[]) =>
            acc.concat(thisLabels)
          )
      );

      // add label folders to zip:
      for (const label of allLabels) {
        const labelFolder = zip.folder(label);
        // add images to label folder in zip:
        for (let i = 0; i < images.length; i += 1) {
          if (collectionContent[i].imageLabels.includes(label)) {
            labelFolder.file(allnames[i], images[i].content, {
              base64: true,
            });
          }
        }
      }

      // put unlabelled images in their own folder:
      if (collectionContent.filter((tile) => tile.imageLabels === [])) {
        const unlabelledFolder = zip.folder("unlabelled");

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

    // compress data and save to disk:
    const date = new Date();
    const projectName = await props.etebaseInstance
      .getCollectionsMeta()
      .then(
        (collections) =>
          collections.filter((c) => c.uid === collectionUid)[0].name
      )
      .catch((err) => {
        console.log(err);
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
        console.log(err);
      });
  };

  const downloadDatasetCallback = (): void => {
    // check for multi-labelled images:
    for (const tile of collectionContent) {
      if (tile.imageLabels.length > 1) {
        setMulti(true);
        setShowDialog(true);
        return;
      }
    }
    setMulti(false);
    void downloadDataset();
  };

  // runs once on page load, would have been a componentDidMount if this were a class component:
  useEffect(() => {
    if (props.etebaseInstance.ready) {
      fetchGalleries();
    }
  }, [props.etebaseInstance.ready]);

  useEffect(() => {
    if (collectionUid) {
      fetchImageItems();
    }
  }, [collectionUid]);

  if (!props.etebaseInstance || !auth.user || !collectionUid) return null;

  const classes = useStyles()();

  return (
    <>
      <Curate
        metadata={curateInput}
        saveImageCallback={addImageToGallery}
        saveLabelsCallback={saveLabelsCallback}
        deleteImagesCallback={deleteImageCallback}
        annotateCallback={annotateCallback}
        downloadDatasetCallback={downloadDatasetCallback}
        showAppBar={false}
        setIsLoading={props.setIsLoading}
        setTask={props.setTask}
      />
      <Dialog open={showDialog}>
        <Card>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.projectsTypography}>
              Warning
            </Typography>
          </Paper>
          <Typography style={{ margin: "10px" }}>
            Dataset contains multilabel images, this will export as a flat
            directory with a JSON file for labels. Continue?
          </Typography>
          <DialogActions>
            <Button
              onClick={() => {
                setShowDialog(false);
                void downloadDataset();
              }}
              color="primary"
            >
              OK
            </Button>
            <Button
              onClick={() => {
                setShowDialog(false);
              }}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Card>
      </Dialog>
    </>
  );
};
