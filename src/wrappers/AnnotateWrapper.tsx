import { ReactElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { UserInterface, Annotations } from "@gliff-ai/annotate"; // note: Annotations is the annotation data / audit handling class, usually assigned to annotationsObject
import { ImageFileInfo } from "@gliff-ai/upload";
import { DominateStore } from "@/store";
import { Image } from "@/store/interfaces";
import { TSButtonToolbar } from "@/components";
import {
  parseStringifiedSlices,
  getImageFileInfoFromImageMeta,
} from "@/imageConversions";
import { useMountEffect } from "@/hooks/use-mountEffect";

interface Props {
  storeInstance: DominateStore;
  setIsLoading: (isLoading: boolean) => void;
}

export const AnnotateWrapper = (props: Props): ReactElement | null => {
  const { collectionUid = "", imageUid = "" } = useParams();
  const [imageItem, setImageItem] = useState<Image | null>(null);
  const [slicesData, setSlicesData] = useState<ImageBitmap[][] | null>(null);
  const [imageFileInfo, setImageFileInfo] = useState<ImageFileInfo>();
  const [annotationsObject, setAnnotationsObject] =
    useState<Annotations | undefined>(undefined);

  useMountEffect(() => {
    props.setIsLoading(true);
  });

  const saveAnnotation = (newAnnotationsObject: Annotations): void => {
    // Save annotations data
    const annotationsData = newAnnotationsObject.getAllAnnotations();
    const auditData = newAnnotationsObject.getAuditObject();

    if (annotationsObject === null) {
      // If an annotation item for the given image does not exist, create one.
      props.storeInstance
        .createAnnotation(collectionUid, imageUid, annotationsData, auditData)
        .catch((e) => console.log(e));
    } else {
      // Otherwise update it.
      props.storeInstance
        .updateAnnotation(collectionUid, imageUid, annotationsData, auditData)
        .catch((e) => console.log(e));
    }
  };

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
        .then((retrievedAnnotationsObject) => {
          setAnnotationsObject(retrievedAnnotationsObject);
        })
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
        <TSButtonToolbar
          placement="annotate"
          collectionUid={collectionUid}
          imageUid={imageUid}
        />
      }
    />
  ) : null;
};
