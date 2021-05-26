import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { UserInterface as Curate } from "@gliff-ai/curate";

import { DominateEtebase, Collection, Item, Gallery } from "@/etebase";
import { Slices, Image } from "@/etebase/interfaces";

export interface Match {
  path: string;
  params?: {
    id?: string;
  };
}

interface Props {
  etebaseInstance: DominateEtebase;
  match?: Match;
}

interface State {
  collectionsMeta: Gallery[];
  items: Image[];
}

export class CurateWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      collectionsMeta: [],
      items: [],
    };
  }

  imageFileInfo: ImageFileInfo;
  slicesData: Slices;

  componentDidMount() {
    if (this.props.etebaseInstance) {
      const collectionId = this.props.match?.params?.id;
      if (collectionId) {
        console.log("getting items!");
        console.log(collectionId);
        this.props.etebaseInstance
          .getImagesMeta(collectionId)
          .then((items) => {
            console.log(items);
            this.setState({ items });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        // No id, get all collections
        console.log("getting galleries!");

        this.props.etebaseInstance
          .getCollectionsMeta("gliff.gallery")
          .then((collectionsMeta) => {
            this.setState({ collectionsMeta });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      console.log("getting nothing!");
    }
  }

  componentDidUpdate(prevProps: Props) {
    console.log(this.props.match.path);
    if (prevProps.match.path !== this.props.match.path) {
      // If we've changed route, definitely update
      const collectionId = this.props.match?.params?.id;
      if (collectionId) {
        this.props.etebaseInstance
          .getImagesMeta(collectionId)
          .then((items) => {
            this.setState({ items });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        this.props.etebaseInstance
          .getCollectionsMeta("gliff.gallery")
          .then((collectionsMeta) => this.setState({ collectionsMeta }))
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  setUploadedImage =
    (colUid) =>
    async (imageFileInfo: ImageFileInfo, slicesData: Slices): Promise<void> => {
      this.imageFileInfo = imageFileInfo;
      this.slicesData = slicesData;

      // Create temporary collection
      // this.props.etebaseInstance
      //   .createCollection("temp-gallery")
      //   .then((uid) => {
      //   })
      //   .catch((e) => console.log(e));

      this.props.etebaseInstance
        .createImage(colUid, this.slicesData)
        .then(() => console.log(`Added new image to collection ${colUid}.`))
        .catch((e) => console.log(e));
    };

  render = (): ReactNode => {
    if (this.props.etebaseInstance) {
      return (
        <div>
          <h3>Collections:</h3>
          {this.state.collectionsMeta
            ? this.state.collectionsMeta.map((col) => (
                <>
                  <span key={col.uid}>
                    <Link to={`/curate/${col.uid}`}>{col.name}</Link>
                    <br />
                  </span>

                  <UploadImage
                    setUploadedImage={this.setUploadedImage(col.uid)}
                    spanElement={<span>Upload Image</span>}
                    multiple
                  />
                </>
              ))
            : null}

          <h3>Items</h3>
          {this.state.items.map((item) => (
            <span key={item.uid}>
              <Link
                to={`/annotate/${this.props.match?.params?.id}/${item.uid}`}
              >
                {item.name}
              </Link>
            </span>
          ))}
        </div>
      );
    }
    return null;
  };
}
