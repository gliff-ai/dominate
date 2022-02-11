import { ReactElement, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import { UserInterface, Annotations } from "@gliff-ai/annotate"; // note: Annotations is the annotation data / audit handling class, usually assigned to annotationsObject
import { ImageFileInfo } from "@gliff-ai/upload";
import { icons, IconButton } from "@gliff-ai/style";
import { DominateStore } from "@/store";
import { AnnotationMeta } from "@/store/interfaces";
import { Task, TSButtonToolbar } from "@/components";
import { parseStringifiedSlices } from "@/imageConversions";
import { useAuth, useStore } from "@/hooks";
import { setStateIfMounted } from "@/helpers";
import { UserAccess } from "@/hooks/use-auth";

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
  const [imageContent, setImageContent] = useState<string | null>(null);
  const [slicesData, setSlicesData] = useState<ImageBitmap[][] | null>(null);
  const [imageFileInfo, setImageFileInfo] = useState<ImageFileInfo>();
  const [annotationsObject, setAnnotationsObject] = useState<Annotations>();

  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [imageUids, setImageUids] = useState<string[] | null>(null);
  const [currImageIdx, setCurrImageIdx] = useState<number | null>(null);
  const isMounted = useRef(false);
  const classes = useStyle();

  const canCycle = (): boolean =>
    Boolean(imageUids && currImageIdx !== null && imageUids?.length > 1);

  function cycleImage(forward = true): void {
    if (!imageUids || currImageIdx === null) return;
    const inc = forward ? 1 : -1;
    const newIndex = (currImageIdx + inc + imageUids.length) % imageUids.length;
    setImageContent(null);
    setSlicesData(null);
    navigate(`/annotate/${collectionUid}/${imageUids[newIndex]}`);
  }

  const fetchImageItems = useStore(
    props,
    (storeInstance) => {
      if (!auth?.user?.username) return;
      const canViewAllImages =
        auth.userAccess === UserAccess.Owner ||
        auth.userAccess === UserAccess.Member;

      storeInstance
        .getImagesMeta(collectionUid, auth?.user.username)
        .then((items) => {
          const imageUIDs = items
            .filter(
              (item) =>
                (canViewAllImages ||
                  item.assignees.includes(auth?.user?.username as string)) &&
                item.imageUID
            )
            .map((item) => item.imageUID);
          setStateIfMounted(imageUIDs, setImageUids, isMounted.current);
          const fileInfo = items.find(
            (item) => item.imageUID === imageUid
          )?.fileInfo;
          if (fileInfo) {
            setStateIfMounted(
              new ImageFileInfo(fileInfo),
              setImageFileInfo,
              isMounted.current
            );
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [collectionUid, isMounted, auth]
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
            size="large"
          />
        </Card>
        <Card className={classes.cardSize}>
          <IconButton
            icon={icons.tick}
            tooltip={{ name: "Mark Annotation As Complete" }}
            onClick={() => setIsComplete((prevIsComplete) => !prevIsComplete)}
            fill={isComplete}
            tooltipPlacement="bottom"
            size="large"
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
            size="large"
          />
        </Card>
      </div>
    );
  }

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    props.setIsLoading(true);
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!collectionUid) return;
    fetchImageItems();
  }, [collectionUid]);

  useEffect(() => {
    if (!imageUids) return;
    setCurrImageIdx(imageUids.indexOf(imageUid));
  }, [imageUids, imageUid]);

  const saveAnnotation = (newAnnotationsObject: Annotations): void => {
    if (!auth?.user?.username) return;

    // Save annotations data
    props.setTask({
      isLoading: true,
      description: "Saving annotation...",
      progress: 0,
    });
    const annotationsData = newAnnotationsObject.getAllAnnotations();
    const auditData = newAnnotationsObject.getAuditObject();

    props.storeInstance
      .updateAnnotation(
        collectionUid,
        imageUid,
        annotationsData,
        auditData,
        isComplete,
        props.task,
        props.setTask,
        auth.user.username
      )
      .then(() => {
        props.setTask({ isLoading: false, description: "" });
      })
      .catch((e) => console.error(e));
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
          setStateIfMounted(image, setImageContent, isMounted.current);
        })
        .catch((e) => console.error(e));
    };

    const createAnnotationsObject = (): Annotations | undefined => {
      if (!auth?.user?.username) return undefined;

      const newAnnotationsObject = new Annotations();
      newAnnotationsObject.addAnnotation("paintbrush");

      const annotationsData = newAnnotationsObject.getAllAnnotations();
      const auditData = newAnnotationsObject.getAuditObject();

      props.storeInstance
        .createAnnotation(
          collectionUid,
          imageUid,
          annotationsData,
          auditData,
          isComplete,
          auth.user.username
        )
        .catch((e) => console.error(e));

      return newAnnotationsObject;
    };

    const getAnnotationsObject = (): void => {
      if (!auth?.user?.username) return;

      // Set state for annotation items.
      props.storeInstance
        .getAnnotationsObject(collectionUid, imageUid, auth?.user.username)
        .then(
          (data: { annotations: Annotations; meta: AnnotationMeta } | null) => {
            setStateIfMounted(
              data?.annotations || createAnnotationsObject(),
              setAnnotationsObject,
              isMounted.current
            );
            setStateIfMounted(
              data?.meta?.isComplete || false,
              setIsComplete,
              isMounted.current
            );
          }
        )
        .catch((e) => console.error(e));
    };

    // launches image and annotation retrieval on page load
    getImage();
    getAnnotationsObject();
  }, [
    collectionUid,
    imageUid,
    props.storeInstance,
    props.storeInstance.ready,
    auth,
    isMounted,
  ]);

  useEffect(() => {
    if (imageContent) {
      // Set slicesData
      parseStringifiedSlices(
        imageContent
        // imageContent.meta.width,
        // imageContent.meta.height
      )
        .then((newSlicesData) => {
          setSlicesData(newSlicesData);
        })
        .catch((e) => console.error(e));
      // // Set imageFileInfo
      // const fileInfo = getImageFileInfoFromImageMeta(
      //   imageContent.uid,
      //   imageContent.meta
      // );
      // setImageFileInfo(fileInfo);
    }
  }, [imageContent]);

  if (
    !props.storeInstance ||
    !collectionUid ||
    !imageUid ||
    !auth ||
    !auth.userAccess
  )
    return null;

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
      userAccess={auth.userAccess}
    />
  );
};
