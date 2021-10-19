import { ReactElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, makeStyles } from "@material-ui/core";

import { UserInterface, Annotations } from "@gliff-ai/annotate"; // note: Annotations is the annotation data / audit handling class, usually assigned to annotationsObject
import { ImageFileInfo } from "@gliff-ai/upload";
import { icons, IconButton } from "@gliff-ai/style";
import { DominateStore } from "@/store";
import { AnnotationMeta, Image } from "@/store/interfaces";
import { Task, TSButtonToolbar } from "@/components";
import {
  parseStringifiedSlices,
  getImageFileInfoFromImageMeta,
} from "@/imageConversions";
import { useMountEffect } from "@/hooks/use-mountEffect";

interface Props {
  storeInstance: DominateStore;
  setIsLoading: (isLoading: boolean) => void;
  task: Task;
  setTask: (task: Task) => void;
  setProductSection: (productSection: JSX.Element | null) => void;
}

const useStyle = makeStyles({
  sectionContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  cardSize: {
    width: 40,
    height: 40,
    borderRadius: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cardLeft: {
    borderRadius: "6px 0 0 6px",
  },
  cardRight: { borderRadius: "0 6px 6px 0" },
});

export const AnnotateWrapper = (props: Props): ReactElement | null => {
  const { collectionUid = "", imageUid = "" } = useParams();
  const [imageItem, setImageItem] = useState<Image | null>(null);
  const [slicesData, setSlicesData] = useState<ImageBitmap[][] | null>(null);
  const [imageFileInfo, setImageFileInfo] = useState<ImageFileInfo>();
  const [annotationsObject, setAnnotationsObject] =
    useState<Annotations | undefined>(undefined);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const classes = useStyle();

  useMountEffect(() => {
    props.setIsLoading(true);
  });

  function updateProductSection(): void {
    props.setProductSection(
      <div className={classes.sectionContainer}>
        <Card className={`${classes.cardSize} ${classes.cardLeft}`}>
          <IconButton
            icon={icons.add}
            tooltip={{ name: "Previous Image" }}
            onClick={() => console.log("load previous image")}
            tooltipPlacement="bottom"
          />
        </Card>
        <Card className={classes.cardSize}>
          <IconButton
            icon={icons.add}
            tooltip={{ name: "Mark Annotation As Complete" }}
            onClick={() => setIsComplete((prevIsComplete) => !prevIsComplete)}
            fill={isComplete}
            tooltipPlacement="bottom"
          />
        </Card>
        <Card className={`${classes.cardSize} ${classes.cardRight}`}>
          <IconButton
            icon={icons.add}
            tooltip={{ name: "Next Image" }}
            onClick={() => console.log("load next image")}
            tooltipPlacement="bottom"
          />
        </Card>
      </div>
    );
  }

  const saveAnnotation = (newAnnotationsObject: Annotations): void => {
    // Save annotations data
    props.setTask({
      isLoading: true,
      description: "Saving annotation...",
      progress: 0,
    });
    const annotationsData = newAnnotationsObject.getAllAnnotations();
    const auditData = newAnnotationsObject.getAuditObject();

    if (annotationsObject === undefined) {
      // If an annotation item for the given image does not exist, create one.
      props.storeInstance
        .createAnnotation(
          collectionUid,
          imageUid,
          annotationsData,
          auditData,
          isComplete,
          props.task,
          props.setTask
        )
        .then(() => {
          props.setTask({ isLoading: false, description: "" });
        })
        .catch((e) => console.log(e));
    } else {
      // Otherwise update it.
      props.storeInstance
        .updateAnnotation(
          collectionUid,
          imageUid,
          annotationsData,
          auditData,
          isComplete,
          props.task,
          props.setTask
        )
        .then(() => {
          props.setTask({ isLoading: false, description: "" });
        })
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    updateProductSection();
  }, [isComplete]);

  useEffect(() => {
    const getImage = (): void => {
      // Retrieve image item and set it as state
      props.storeInstance
        .getImage(collectionUid, imageUid)
        .then((image) => {
          setImageItem(image);
        })
        .catch((e) => console.log(e));
    };

    const getAnnotationsObject = (): void => {
      // Set state for annotation items.
      props.storeInstance
        .getAnnotationsObject(collectionUid, imageUid)
        .then(
          (data: { annotations: Annotations; meta: AnnotationMeta } | null) => {
            if (data) {
              setAnnotationsObject(data.annotations);
              setIsComplete(data.meta.isComplete);
            }
          }
        )
        .catch((e) => console.log(e));
    };

    // launches image and annotation retrieval on page load
    getImage();
    getAnnotationsObject();
  }, [collectionUid, imageUid, props.storeInstance, props.storeInstance.ready]);

  useEffect(() => {
    if (imageItem) {
      // Set slicesData
      parseStringifiedSlices(
        imageItem.content,
        imageItem.meta.width,
        imageItem.meta.height
      )
        .then((newSlicesData) => {
          setSlicesData(newSlicesData);
        })
        .catch((e) => console.log(e));
      // Set imageFileInfo
      const fileInfo = getImageFileInfoFromImageMeta(
        imageItem.uid,
        imageItem.meta
      );
      setImageFileInfo(fileInfo);
    }
  }, [imageItem]);

  if (!collectionUid || !imageUid) return null;

  return slicesData ? (
    <UserInterface
      showAppBar={false}
      slicesData={slicesData}
      imageFileInfo={imageFileInfo}
      annotationsObject={annotationsObject}
      saveAnnotationsCallback={saveAnnotation}
      setIsLoading={props.setIsLoading}
      trustedServiceButtonToolbar={
        <TSButtonToolbar collectionUid={collectionUid} imageUid={imageUid} />
      }
    />
  ) : null;
};
