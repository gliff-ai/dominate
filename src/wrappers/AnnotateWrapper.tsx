import { ReactElement, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useAuth, useStore, useMountEffect } from "@/hooks";

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
  rotateIcon: { transform: "rotate(180deg)" },
});

export const AnnotateWrapper = (props: Props): ReactElement | null => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { collectionUid = "", imageUid = "" } = useParams();
  const [imageItem, setImageItem] = useState<Image | null>(null);
  const [slicesData, setSlicesData] = useState<ImageBitmap[][] | null>(null);
  const [imageFileInfo, setImageFileInfo] = useState<ImageFileInfo>();
  const [annotationsObject, setAnnotationsObject] = useState<Annotations>();

  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [imageUids, setImageUids] = useState<string[] | null>(null);
  const [currImageIdx, setCurrImageIdx] = useState<number | null>(null);
  const classes = useStyle();

  useMountEffect(() => {
    props.setIsLoading(true);
  });

  const canCycle = (): boolean =>
    Boolean(imageUids && currImageIdx !== null && imageUids?.length > 1);

  function cycleImage(forward = true): void {
    if (!imageUids || currImageIdx === null) return;
    const inc = forward ? 1 : -1;
    const newIndex = (currImageIdx + inc + imageUids.length) % imageUids.length;
    setImageItem(null);
    setSlicesData(null);
    navigate(`/annotate/${collectionUid}/${imageUids[newIndex]}`);
  }

  const fetchImageItems = useStore(
    props,
    (storeInstance) => {
      storeInstance
        .getImagesMeta(collectionUid)
        .then((items) => {
          const userIsOwner =
            auth?.userProfile?.id === auth?.userProfile?.team?.owner_id;
          const wrangled = items
            .filter(
              (item) =>
                (userIsOwner ||
                  item.assignees.includes(auth?.user?.username as string)) &&
                item.imageUID
            )
            .map((item) => item.imageUID);
          setImageUids(wrangled);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    [collectionUid]
  );

  function updateProductSection(): void {
    props.setProductSection(
      <div className={classes.sectionContainer}>
        <Card className={`${classes.cardSize} ${classes.cardLeft}`}>
          <IconButton
            icon={icons.previousNext}
            tooltip={{ name: "Previous Image" }}
            onClick={() => cycleImage(false)}
            tooltipPlacement="bottom"
            disabled={!canCycle()}
          />
        </Card>
        <Card className={classes.cardSize}>
          <IconButton
            icon={icons.tick}
            tooltip={{ name: "Mark Annotation As Complete" }}
            onClick={() => setIsComplete((prevIsComplete) => !prevIsComplete)}
            fill={isComplete}
            tooltipPlacement="bottom"
          />
        </Card>
        <Card className={`${classes.cardSize} ${classes.cardRight}`}>
          <IconButton
            className={classes.rotateIcon}
            icon={icons.previousNext}
            tooltip={{ name: "Next Image" }}
            onClick={() => cycleImage()}
            tooltipPlacement="bottom"
            disabled={!canCycle()}
          />
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (!collectionUid) return;
    fetchImageItems();
  }, [collectionUid]);

  useEffect(() => {
    if (!imageUids) return;
    setCurrImageIdx(imageUids.indexOf(imageUid));
  }, [imageUids, imageUid]);

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
  }, [isComplete, currImageIdx, imageUids]);

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
            setAnnotationsObject(data?.annotations || undefined);
            setIsComplete(data?.meta?.isComplete || false);
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

  if (!props.storeInstance || !collectionUid || !imageUid) return null;

  return (
    <UserInterface
      showAppBar={false}
      slicesData={slicesData}
      imageFileInfo={imageFileInfo}
      annotationsObject={slicesData ? annotationsObject : undefined}
      saveAnnotationsCallback={saveAnnotation}
      setIsLoading={props.setIsLoading}
      trustedServiceButtonToolbar={
        <TSButtonToolbar collectionUid={collectionUid} imageUid={imageUid} />
      }
    />
  );
};
