import React, { ReactElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase, Gallery, Image } from "@/etebase";
import { Slices } from "@/etebase/interfaces";
// import { UserInterface as Curate } from "@gliff-ai/curate";
import {
  stringifySlices,
  parseStringifiedSlices,
  getImageMetaFromImageFileInfo,
} from "@/imageConversions";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const CurateWrapper = (props: Props): ReactElement | null => {
  if (!props.etebaseInstance) return null;
  const [galleryItems, setGalleryItems] = useState<Gallery[]>([]);
  const [imageItems, setImageItems] = useState<Image[]>([]);
  const { id: galleryUid } = useParams();
  const [galleryCount, setGalleryCount] = useState(0);

  const fetchImageItems = (): void => {
    props.etebaseInstance
      .getImagesMeta(galleryUid)
      .then((items) => {
        console.log(items);
        setImageItems(items);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchGalleryItems = (): void => {
    props.etebaseInstance
      .getCollectionsMeta("gliff.gallery")
      .then((items) => {
        console.log(items);
        setGalleryItems(items);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createGalleryCollection = (): void => {
    // Create new gallery collection.
    props.etebaseInstance
      .createCollection(`gallery${galleryCount}`)
      .then((uid) => console.log(uid))
      .catch((e) => console.log(e));

    // Update gallery count
    setGalleryCount((prevCount) => prevCount + 1);
  };

  const convertImage = async (
    imageFileInfo: ImageFileInfo,
    slicesData: Slices
  ): Promise<void> => {
    // Upload an image and convert it to a stringified array of base64
    // encoded images.
    // (this function is here to check out the conversion and won't get into main).
    const t0 = performance.now();
    const stringifiedImage = stringifySlices(slicesData);
    console.log(`time1: ${performance.now() - t0}`);

    const slicesBitmap = await parseStringifiedSlices(
      stringifiedImage,
      imageFileInfo.width,
      imageFileInfo.height
    );

    console.log(`time2: ${performance.now() - t0}`);
    console.log(`image to string: ${stringifiedImage}`);
    console.log("from string back to array:");
    console.log(slicesBitmap);
  };

  const setUploadedImage =
    (collectionUid: string) =>
    (imageFileInfo: ImageFileInfo, slicesData: Slices): void => {
      // Stringify slices data and get image metadata
      const stringfiedSlices = stringifySlices(slicesData);
      const imageMeta = getImageMetaFromImageFileInfo(imageFileInfo);

      // Store slices and metadata inside gliff.image item and add it to gallery
      props.etebaseInstance
        .createImage(collectionUid, imageMeta, stringfiedSlices)
        .then(() =>
          console.log(`Added new image to collection ${collectionUid}.`)
        )
        .catch((e) => console.log(e));
    };

  useEffect(() => {
    fetchGalleryItems();
  }, [props.etebaseInstance]);

  useEffect(() => {
    console.log(galleryUid);
    if (galleryUid) {
      fetchImageItems();
    }
  }, [galleryUid]);

  return (
    <div>
      <UploadImage
        setUploadedImage={convertImage}
        spanElement={<span>Image upload and base64 encode</span>}
        multiple
      />
      <button onClick={createGalleryCollection} type="button">
        New Gallery
      </button>
      <h3>Collections:</h3>
      {galleryItems
        ? galleryItems.map((item) => (
            <>
              <span key={item.uid}>
                <Link key={item.uid} to={`/curate/${item.uid}`}>
                  {item.name}
                </Link>
                <UploadImage
                  setUploadedImage={setUploadedImage(item.uid)}
                  spanElement={<span key={item.uid}>Add image</span>}
                  multiple
                />
              </span>
              <br />
            </>
          ))
        : null}

      <h3>Items</h3>
      {imageItems
        ? imageItems.map((item) => (
            <>
              <span key={item.uid}>
                <Link key={item.uid} to={`/annotate/${item.uid}`}>
                  {item.uid}
                </Link>
              </span>
              <br />
            </>
          ))
        : null}
    </div>
  );
};
