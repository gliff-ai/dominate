import React, { ReactElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase, Gallery, Image } from "@/etebase";
import { Slices, MetaItem, GalleryTile } from "@/etebase/interfaces";
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
  const [galleryItems, setGalleryItems] = useState<Gallery[]>([]); // the objects we list under "Collections"
  const [imageItems, setImageItems] = useState<Image[]>([]); // the objects we list under "Items"
  const [galleryTiles, setGalleryTiles] = useState<GalleryTile[]>([]); // the information a gallery stores about its contents
  const [curateInput, setCurateInput] = useState<MetaItem[]>([]); // the array of image metadata (including thumbnails) passed into curate
  const { id: galleryUid } = useParams(); // uid of selected gallery, from URL ( === galleryItems[something].uid)

  const fetchImageItems = (): void => {
    // fetches images via DominateEtebase, and assigns them to imageItems state
    props.etebaseInstance
      .getImagesMeta(galleryUid)
      .then(async (items) => {
        // set galleryTiles so that etebase pointers are kept:
        setGalleryTiles(items);

        // discard imageUID, annotationUID and auditUID, and unpack item.metadata:
        const wrangled = items.map((item) => ({
          thumbnail: item.thumbnail,
          ...item.metadata,
        }));

        // convert base64 thumbnail strings into ImageBitmap:
        const promises = wrangled.map((item) => {
          const img = new Image();
          img.src = item.thumbnail;
          return createImageBitmap(img);
        });
        const thumbnails = await Promise.all(promises);

        // merge thumbnails back into item metadata:
        setCurateInput(
          wrangled.map((item, i) => ({
            ...item,
            thumbnail: thumbnails[i],
          }))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchGalleryItems = (): void => {
    // fetches galleries via DominateEtebase, and assigns them to galleryItems state
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

  // runs once on page load, would have been a componentDidMount if this were a class component:
  useEffect(() => {
    fetchGalleryItems();
  }, [props.etebaseInstance]);

  useEffect(() => {
    if (galleryUid) {
      fetchImageItems();
    }
  }, [galleryUid]);

  return galleryUid ? (
    <Curate metadata={curateInput} saveImageCallback={addImageToGallery} />
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
