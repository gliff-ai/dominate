import React, { ReactElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DominateEtebase, Gallery, Image } from "@/etebase";
// import { UserInterface as Curate } from "@gliff-ai/curate";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const CurateWrapper = (props: Props): ReactElement => {
  const [galleryItems, setGalleryItems] = useState<Gallery[]>([]);
  const [imageItems, setImageItems] = useState<Image[]>([]);
  const { id: galleryUid } = useParams();
  const [galleryCount, setGalleryCount] = useState(0);

  if (!props.etebaseInstance) return null;

  const fetchImageItems = (): void => {
    props.etebaseInstance
      .getImagesMeta(galleryUid)
      .then((items): void => {
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

  useEffect(() => {
    fetchGalleryItems();
  }, [props.etebaseInstance]);

  useEffect(() => {
    if (galleryUid) {
      fetchImageItems();
    }
  }, [galleryItems, galleryUid]);

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
                <Link to={`/curate/${item.uid}`}>{item.name}</Link>
              </span>
              <br />
            </>
          ))
        : null}

      <h3>Items</h3>
      {imageItems
        ? imageItems.map((item) => (
            <span key={item.uid}>
              <Link to={`/annotate/${item.uid}`}>{item.name}</Link>
            </span>
          ))
        : null}
    </div>
  );
};
