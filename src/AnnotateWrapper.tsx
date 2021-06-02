import { ReactElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserInterface as Annotate } from "@gliff-ai/annotate";
import { Annotations } from "@gliff-ai/annotate/dist/src/annotation";
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

  const saveAnnotation = (newAnnotationsObject: Annotations): void => {
    // Save annotations data
    if (annotationItems.length === 0) {
      // If an annotation item for the given image does not exist, create one.
      props.etebaseInstance
        .createAnnotation(collectionUid, imageUid, newAnnotationsObject)
        .catch((e) => console.log(e));
    } else {
      // Otherwise update it.
      props.etebaseInstance
        .updateAnnotation(
          collectionUid,
          annotationItems[0].uid,
          newAnnotationsObject
        )
        .catch((e) => console.log(e));
    }
  };

  const fakeSlicesData = () => {
    const width = 500;
    const height = 500;
    const imageData = new ImageData(
      new Uint8ClampedArray(4 * width * height),
      width,
      height
    );
    createImageBitmap(imageData)
      .then((imageBitmap) => {
        setSlicesData([[imageBitmap]]);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    console.log(`collectionUid: ${collectionUid}, imageUid: ${imageUid}`);
    fakeSlicesData();
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
        .then((newSlicesData) => setSlicesData(newSlicesData))
        .catch((e) => console.log(e));
      // Set imageFileInfo
      setImageFileInfo(
        getImageFileInfoFromImageMeta(imageItem.uid, imageItem.meta)
      );
    }
  }, [imageItem]);

  useEffect(() => {
    // Set annotationsObject
    if (annotationItems.length !== 0) {
      const annotations = JSON.parse(annotationItems[0].content) as Annotations;
      console.log(annotations);
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
