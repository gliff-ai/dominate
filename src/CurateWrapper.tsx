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

  const addImageToGallery =
    (collectionUid: string) =>
    (imageFileInfo: ImageFileInfo, slicesData: Slices): void => {
      // Stringify slices data and get image metadata
      console.log(collectionUid);
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
                  setUploadedImage={addImageToGallery(item.uid)}
                  spanElement={<span key={item.uid}>Add image</span>}
                  multiple={false}
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
                <Link key={item.uid} to={`/annotate/${galleryUid}/${item.uid}`}>
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
