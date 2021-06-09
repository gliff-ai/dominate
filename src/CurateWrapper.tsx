import React, { ReactElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase, Gallery, Image } from "@/etebase";
import { Slices } from "@/etebase/interfaces";
import Curate from "@gliff-ai/curate";

import {
  stringifySlices,
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

  const fetchImageItems = (): void => {
    props.etebaseInstance
      .getImagesMeta(galleryUid)
      .then((items) => {
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
        setGalleryItems(items);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createGalleryCollection = (): void => {
    // Create new gallery collection.
    props.etebaseInstance
      .createCollection(`gallery-${galleryItems.length + 1}`)
      .then((uid) => {
        // Fetch gallery items
        fetchGalleryItems();
      })
      .catch((e) => console.log(e));
  };

  const addImageToGallery = (
    imageFileInfo: ImageFileInfo,
    slicesData: Slices
  ): void => {
    // Stringify slices data and get image metadata
    const stringfiedSlices = stringifySlices(slicesData);
    const imageMeta = getImageMetaFromImageFileInfo(imageFileInfo);

    // Store slices and metadata inside gliff.image item and add it to the selected gallery
    props.etebaseInstance
      .createImage(galleryUid, imageMeta, stringfiedSlices)
      .then(() => {
        // Fetch image items
        fetchImageItems();
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    fetchGalleryItems();
  }, [props.etebaseInstance]);

  useEffect(() => {
    if (galleryUid) {
      fetchImageItems();
    }
  }, [galleryUid]);

  return galleryUid ? (
    <Curate saveImageCallback={addImageToGallery} />
  ) : (
    <>
      <div style={{ display: "flex" }}>
        <button
          onClick={createGalleryCollection}
          type="button"
          style={{ marginRight: 10 }}
        >
          New Gallery
        </button>
        <UploadImage
          setUploadedImage={addImageToGallery}
          spanElement={<span>Add image</span>}
          multiple={false}
        />
      </div>
      <h3>Collections:</h3>
      {galleryItems
        ? galleryItems.map((item) => (
            <React.Fragment key={item.uid}>
              <span>
                <Link to={`/curate/${item.uid}`}>{item.name}</Link>
              </span>
              <br />
            </React.Fragment>
          ))
        : null}

      <h3>Items</h3>
      {imageItems
        ? imageItems.map((item) => (
            <React.Fragment key={item.uid}>
              <span>
                <Link to={`/annotate/${galleryUid}/${item.uid}`}>
                  {item.uid}
                </Link>
              </span>
              <br />
            </React.Fragment>
          ))
        : null}
    </>
  );
};
