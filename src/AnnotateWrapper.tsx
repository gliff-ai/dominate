import React, { ReactElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserInterface as Annotate, Annotations } from "@gliff-ai/annotate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase } from "@/etebase";
import { Annotation, Image, AnnotationData } from "@/etebase/interfaces";
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
  const [annotationItems, setAnnotationItems] = useState<Annotation[]>([]);
  const [imageItem, setImageItem] = useState<Image | null>(null);
  const [slicesData, setSlicesData] = useState<ImageBitmap[][] | null>(null);
  const [imageFileInfo, setImageFileInfo] =
    useState<ImageFileInfo | null>(null);
  const [annotationsObject, setAnnotationsObject] =
    useState<Annotations | null>(null);

  const getImage = (): void => {
    // Retrieve image item and set it as state
    props.etebaseInstance
      .getImage(collectionUid, imageUid)
      .then((image) => {
        setImageItem(image);
      })
      .catch((e) => console.log(e));
  };

  const getAnnotationItems = (): void => {
    // Set state for annotation items.
    props.etebaseInstance
      .getAnnotations(collectionUid, imageUid)
      .then((annotation) => {
        setAnnotationItems(annotation);
      })
      .catch((e) => console.log(e));
  };

  const saveAnnotation = (newAnnotationsObject: Annotations): void => {
    // Save annotations data
    const annotationsData = {
      data: newAnnotationsObject.getAllAnnotations(),
      audit: newAnnotationsObject.getAuditObject(),
    };

    if (annotationItems.length === 0) {
      // If an annotation item for the given image does not exist, create one.
      props.etebaseInstance
        .createAnnotation(collectionUid, imageUid, annotationsData)
        .catch((e) => console.log(e));
    } else {
      // Otherwise update it.
      props.etebaseInstance
        .updateAnnotation(
          collectionUid,
          annotationItems[0].uid,
          annotationsData
        )
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    getImage();
    getAnnotationItems();
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

  useEffect(() => {
    // Set annotationsObject
    if (annotationItems.length !== 0) {
      const annotationsData = JSON.parse(
        annotationItems[0].content
      ) as AnnotationData;

      const annotations = new Annotations(
        annotationsData.data,
        annotationsData.audit
      );

      // TODO: move line below to componenetDidUpdate of Annotate
      // otherwise writes on the wrong active annotation
      annotations.setActiveAnnotationID(0);

      setAnnotationsObject(annotations);
    }
  }, [annotationItems]);

  return slicesData ? (
    <Annotate
      slicesData={slicesData}
      imageFileInfo={imageFileInfo}
      annotationsObject={annotationsObject}
      saveAnnotationsCallback={saveAnnotation}
    />
  ) : null;
};
