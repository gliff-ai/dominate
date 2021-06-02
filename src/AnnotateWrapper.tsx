import { ReactElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserInterface as Annotate, Annotations } from "@gliff-ai/annotate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase } from "@/etebase";
import { Annotation, Image } from "@/etebase/interfaces";
import {
  parseStringifiedSlices,
  getImageFileInfoFromImageMeta,
} from "@/imageConversions";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const AnnotateWrapper = (props: Props): ReactElement | null => {
  if (!props.etebaseInstance) return null;

  const { collectionId: collectionUid, imageId: imageUid } = useParams();
  const [annotationItems, setAnnotationItems] = useState<Annotation[]>([]);
  const [imageItem, setImageItem] = useState<Image | null>(null);

  const getImage = (): void => {
    // Retrieve image item and set it as state
    props.etebaseInstance
      .getImage(collectionUid, imageUid)
      .then((image) => {
        console.log(image);
        setImageItem(image);
      })
      .catch((e) => console.log(e));
  };

  const getAnnotationItems = (): void => {
    // Set state for annotation items.
    props.etebaseInstance
      .getAnnotations(collectionUid, imageUid)
      .then((annotation) => {
        console.log(annotation);
        setAnnotationItems(annotation);
      })
      .catch((e) => console.log(e));
  };

  const saveAnnotation = (annotationsObject: Annotations): void => {
    // Save annotations data
    if (annotationItems.length === 0) {
      // If an annotation item for the given image does not exist, create one.
      props.etebaseInstance
        .createAnnotation(collectionUid, imageUid, annotationsObject)
        .catch((e) => console.log(e));
    } else {
      // Otherwise update it.
      props.etebaseInstance
        .updateAnnotation(
          collectionUid,
          annotationItems[0].uid,
          annotationsObject
        )
        .catch((e) => console.log(e));
    }
  };

  const getSlicesData = async (): Promise<ImageBitmap[][] | null> => {
    // Get image slices data.
    if (imageItem) {
      const slicesData = await parseStringifiedSlices(
        imageItem.content,
        imageItem.meta.width,
        imageItem.meta.height
      );
      console.log(slicesData);
      return slicesData;
    }
    return null;
  };

  const getImageFileInfo = (): ImageFileInfo | null => {
    if (imageItem) {
      return getImageFileInfoFromImageMeta(imageItem.uid, imageItem.meta);
    }
    return null;
  };

  const getAnnotationsObject = (): Annotations | null => {
    // Get annotationsObject from annotation's content.
    if (annotationItems.length !== 0) {
      const annotationsObject = JSON.parse(annotationItems[0].content);
      console.log(annotationsObject);
      return annotationsObject;
    }
    return null;
  };

  useEffect(() => {
    console.log(`collectionUid: ${collectionUid}, imageUid: ${imageUid}`);
    getImage();
    getAnnotationItems();
  }, [collectionUid, imageUid]);

  return (
    <Annotate
      slicesData={getSlicesData()}
      imageFileInfo={getImageFileInfo()}
      annotationsObject={getAnnotationsObject()}
      saveAnnotationsCallback={saveAnnotation}
    />
  );
};
