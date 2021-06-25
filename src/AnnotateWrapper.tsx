import React, { ReactElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Annotate, {
  Annotations,
  Annotation,
  AuditAction,
} from "@gliff-ai/annotate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase } from "@/etebase";
import { Image } from "@/etebase/interfaces";
import {
  parseStringifiedSlices,
  getImageFileInfoFromImageMeta,
} from "@/imageConversions";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const AnnotateWrapper = (props: Props): ReactElement | null => {
  if (!props.etebaseInstance) return null;

  const { collectionUid, imageUid } = useParams();
  const [imageItem, setImageItem] = useState<Image | null>(null);
  const [slicesData, setSlicesData] = useState<ImageBitmap[][] | null>(null);
  const [imageFileInfo, setImageFileInfo] =
    useState<ImageFileInfo | null>(null);
  const [annotationsObject, setAnnotationsObject] = useState<Annotations>(null);

  const getImage = (): void => {
    // Retrieve image item and set it as state
    props.etebaseInstance
      .getImage(collectionUid, imageUid)
      .then((image) => {
        setImageItem(image);
      })
      .catch((e) => console.log(e));
  };

  const getAnnotationsObject = (): void => {
    // Set state for annotation items.
    props.etebaseInstance
      .getAnnotationsObject(collectionUid, imageUid)
      .then((retrievedAnnotationsObject) => {
        console.log("Setting annotationsObject");
        setAnnotationsObject(retrievedAnnotationsObject);
      })
      .catch((e) => console.log(e));
  };

  const saveAnnotation = (newAnnotationsObject: Annotations): void => {
    // Save annotations data
    const annotationsData = newAnnotationsObject.getAllAnnotations();

    if (annotationsObject === null) {
      // If an annotation item for the given image does not exist, create one.
      props.etebaseInstance
        .createAnnotation(collectionUid, imageUid, annotationsData)
        .catch((e) => console.log(e));
    } else {
      // Otherwise update it.
      props.etebaseInstance
        .updateAnnotation(collectionUid, imageUid, annotationsData)
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    // launches image and annotation retrieval on page load
    getImage();
    getAnnotationsObject();
  }, [collectionUid, imageUid]);

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

  return slicesData ? (
    <Annotate
      slicesData={slicesData}
      imageFileInfo={imageFileInfo}
      annotationsObject={annotationsObject}
      saveAnnotationsCallback={saveAnnotation}
    />
  ) : null;
};
