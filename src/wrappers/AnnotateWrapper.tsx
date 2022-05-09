import {
  ReactElement,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { UserInterface, Annotations } from "@gliff-ai/annotate"; // note: Annotations is the annotation data / audit handling class, usually assigned to annotationsObject
import { ImageFileInfo } from "@gliff-ai/upload";
import { icons, IconButton, Task } from "@gliff-ai/style";
import { OutputFormat } from "etebase";
import { ProductNavbarData } from "@/components";
import { DominateStore } from "@/store";
import { AnnotationMeta, GalleryMeta } from "@/interfaces";
import { parseStringifiedSlices } from "@/imageConversions";
import { useAuth, useStore, usePlugins } from "@/hooks";
import { UserAccess } from "@/hooks/use-auth";
import {
  convertMetadataToGalleryTiles,
  setStateIfMounted,
  MetaItemWithId,
} from "@/helpers";
import { Product } from "@/plugins";

interface Props {
  storeInstance: DominateStore;
  setIsLoading: (isLoading: boolean) => void;
  task: Task;
  setTask: (task: Task) => void;
  setProductNavbarData: (data: ProductNavbarData) => void;
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

let isCompleteButtonClicked = false;
// Tells a useEffect hook that isComplete changed because the button was clicked, not
// because isComplete has just loaded from store. This is a common problem with hooks, with no clear solution:
// https://stackoverflow.com/questions/56247433/how-to-use-setstate-callback-on-react-hooks

export const AnnotateWrapper = ({
  storeInstance,
  setIsLoading,
  task,
  setTask,
  setProductSection,
  setProductNavbarData,
}: Props): ReactElement | null => {
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
  const [collectionTitle, setCollectionTitle] = useState<string>("");
  const [defaultLabels, setDefaultLabels] = useState<string[]>([]);
  const [restrictLabels, setRestrictLabels] = useState<boolean>(false);
  const [multiLabel, setMultiLabel] = useState<boolean>(true);
  const plugins = usePlugins(collectionUid, auth, Product.ANNOTATE);

  const isMounted = useRef(false);
  const classes = useStyle();

  const canCycle = useMemo(
    (): boolean =>
      Boolean(imageUids && currImageIdx !== null && imageUids?.length > 1),
    [imageUids, currImageIdx]
  );

  const cycleImage = useCallback(
    (forward = true): void => {
      if (!imageUids || currImageIdx === null || !collectionUid) return;

      const inc = forward ? 1 : -1;
      const newIndex =
        (currImageIdx + inc + imageUids.length) % imageUids.length;
      setImageContent(null);
      setSlicesData(null);
      navigate(`/annotate/${collectionUid}/${imageUids[newIndex]}`);
    },
    [imageUids, currImageIdx, navigate, collectionUid]
  );

  const isOwnerOrMember = useMemo(
    () =>
      auth?.userAccess
        ? auth.userAccess === UserAccess.Owner ||
          auth.userAccess === UserAccess.Member
        : null,
    [auth?.userAccess]
  );

  const fetchImageItems = useStore(
    storeInstance,
    () => {
      // fetch the images' uids and metadata (i.e., imageFileInfo)
      if (
        !auth?.user?.username ||
        !collectionUid ||
        !imageUid ||
        isOwnerOrMember === null
      )
        return;

      void storeInstance
        .getImagesMeta(collectionUid)
        .then((items) => {
          const newImageUIDs = items.tiles
            .filter(
              ({ assignees, imageUID }) =>
                (isOwnerOrMember ||
                  assignees.includes(auth?.user?.username as string)) &&
                imageUID
            )
            .map(({ imageUID }) => imageUID);
          const projectName = items.galleryMeta.name;
          setStateIfMounted(newImageUIDs, setImageUids, isMounted.current);
          setStateIfMounted(projectName, setCollectionTitle, isMounted.current);

          const fileInfo = items.tiles.find(
            (item) => item.imageUID === imageUid
          )?.fileInfo;
          if (fileInfo) {
            setStateIfMounted(fileInfo, setImageFileInfo, isMounted.current);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [auth?.user?.username, collectionUid, isOwnerOrMember, imageUid]
  );

  const updateProductSection = useCallback((): void => {
    setProductSection(
      <div className={classes.sectionContainer}>
        <Card className={`${classes.cardSize} ${classes.cardLeft}`}>
          <IconButton
            icon={icons.previousNext}
            tooltip={{ name: "Previous Image" }}
            onClick={() => cycleImage(false)}
            tooltipPlacement="bottom"
            disabled={!canCycle}
            size="small"
          />
        </Card>
        <Card className={classes.cardSize}>
          <IconButton
            icon={icons.tick}
            tooltip={{ name: "Mark Annotation As Complete" }}
            onClick={() => {
              setIsComplete((prevIsComplete) => !prevIsComplete);
              isCompleteButtonClicked = true;
            }}
            fill={isComplete}
            tooltipPlacement="bottom"
            size="small"
          />
        </Card>
        <Card className={`${classes.cardSize} ${classes.cardRight}`}>
          <IconButton
            className={classes.rotateIcon}
            icon={icons.previousNext}
            tooltip={{ name: "Next Image" }}
            onClick={() => cycleImage()}
            tooltipPlacement="bottom"
            disabled={!canCycle}
            size="small"
          />
        </Card>
      </div>
    );
  }, [isComplete, canCycle, imageUids, currImageIdx, cycleImage]);

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

  const saveAnnotation = useCallback(
    (newAnnotationsObject: Annotations): void => {
      if (!auth?.user?.username) return;

      // Save annotations data
      setTask({
        isLoading: true,
        description: "Saving annotation in progress, please wait...",
        progress: 0,
      });
      const annotationsData = newAnnotationsObject.getAllAnnotations();

      const auditData = newAnnotationsObject.getAuditObject();

      storeInstance
        .updateAnnotation(
          collectionUid,
          imageUid,
          annotationsData,
          auditData,
          isComplete,
          task,
          setTask,
          auth.user.username
        )
        .then(() => {
          setTask({
            isLoading: true,
            description: "Saving annotation complete!",
            progress: 100,
          });
          setTimeout(() => {
            setTask({ isLoading: false, description: "" });
          }, 5000);
        })
        .catch((e) => console.error(e));
    },
    [
      storeInstance,
      setTask,
      auth?.user?.username,
      collectionUid,
      imageUid,
      isComplete,
      task,
    ]
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
    // fetch the images' uids and metadata (should run every time imageUid changes)
    fetchImageItems();
  }, [storeInstance, fetchImageItems]);

  useEffect(() => {
    // fetch all labels (should run once at mount)
    if (!collectionUid) return;

    storeInstance
      .getCollectionMeta(collectionUid)
      .then((meta: GalleryMeta) => {
        setDefaultLabels(meta.defaultLabels);
        setRestrictLabels(meta.restrictLabels);
        setMultiLabel(meta.multiLabel);
      })
      .catch((e) => console.error(e));
  }, [storeInstance, collectionUid]);

  useEffect(() => {
    const getImage = (): Promise<string> =>
      // Retrieve image item and set it as state
      // DominateStore needs to be able to redirect to a new URL if/when converting the image from collection to item, because the UID will change,
      // but it can't useNavigate by itself because it's not a function component, so pass it here:
      // storeInstance.giveNavigate(navigate);
      storeInstance
        .getItem(collectionUid, imageUid)
        .then(async (image) => {
          setStateIfMounted(
            await image.getContent(OutputFormat.String),
            setImageContent,
            isMounted.current
          );
          return image.uid;
        })
        .catch((e) => {
          console.error(e);
          return "";
        });

    const createAnnotationsObject = (): Annotations | undefined => {
      if (!auth?.user?.username) return undefined;

      const newAnnotationsObject = new Annotations();
      newAnnotationsObject.addAnnotation("paintbrush");

      const annotationsData = newAnnotationsObject.getAllAnnotations();
      const auditData = newAnnotationsObject.getAuditObject();

      storeInstance
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

    const getAnnotationsObject = (): Promise<void> => {
      if (!auth?.user?.username) return Promise.resolve();

      // Set state for annotation items.
      return storeInstance
        .getAnnotationsObject(collectionUid, imageUid, auth.user.username)
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
    Promise.all([getImage(), getAnnotationsObject()])
      .then(([newImageUid, _]) => {
        if (newImageUid !== imageUid) {
          // redirect if image UID has changed due to item -> collection migration:
          // commented out for now until we re-add item -> collection conversion
          // console.log("redirecting in AnnotateWrapper");
          // navigate(`/annotate/${collectionUid}/${newImageUid}`);
        }
      })
      .catch((e) => console.error(e));
  }, [
    storeInstance,
    collectionUid,
    imageUid,
    isComplete,
    auth?.user?.username,
  ]);

  useEffect(() => {
    // trigger save annotation (should run when annotationsObject changes, provided the complete button has been clicked).
    if (annotationsObject === undefined || !isCompleteButtonClicked) return;

    saveAnnotation(annotationsObject);
    isCompleteButtonClicked = false;
  }, [saveAnnotation, annotationsObject]);

  useEffect(() => {
    // set slicesData (should run when imageContent changes, provided imageContent is set)
    // we use isMounted here because this useEffect takes a long time to complete.
    if (!imageContent || !isMounted.current) return;

    parseStringifiedSlices(imageContent)
      .then((newSlicesData) => {
        setStateIfMounted(newSlicesData, setSlicesData, isMounted.current);
      })
      .catch((e) => console.error(e));
  }, [imageContent, isMounted]);

  useEffect(() => {
    // set the current image index (should run when imageUid changes, provided imageUids is set)
    if (!imageUids) return;

    setCurrImageIdx(imageUids.indexOf(imageUid));
  }, [imageUids, imageUid]);

  useEffect(() => {
    // update the navbar's product section (will be replaced soon)
    updateProductSection();
  }, [updateProductSection]);

  useEffect(() => {
    setProductNavbarData({
      teamName: auth?.userProfile?.team.name || "",
      projectName: collectionTitle || "",
      imageName: imageFileInfo?.fileName || "",
      buttonBack: (
        <IconButton
          onClick={() => navigate(`/curate/${collectionUid}`)}
          tooltip={{
            name: `Open ${collectionTitle} in CURATE `,
          }}
          tooltipPlacement="bottom"
          icon={icons.navigationCURATE}
        />
      ),
      buttonForward: null,
      productLocation: "ANNOTATE",
      productLocationIcon: "annotate",
    });
  }, [imageFileInfo, collectionTitle]);

  if (
    !storeInstance ||
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
      setIsLoading={setIsLoading}
      userAccess={auth.userAccess}
      plugins={plugins}
      launchPluginSettingsCallback={
        Number(auth?.userProfile?.team?.tier?.id) > 1 && isOwnerOrMember
          ? () => navigate(`/manage/plugins`)
          : null
      }
      defaultLabels={defaultLabels}
      restrictLabels={restrictLabels}
      multiLabel={multiLabel}
      saveMetadataCallback={saveMetadataCallback}
    />
  );
};
