import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { UserInterface as Curate } from "@gliff-ai/curate";

import { DominateEtebase, Collection, Item, Gallery } from "@/etebase";
import { Slices, Image } from "@/etebase/interfaces";

export interface Match {
  path: string;
  params: {
    id: string;
  };
}

interface Props {
  etebaseInstance: DominateEtebase;
  match?: Match;
}

interface State {
  collectionsMeta: Gallery[];
  collectionId?: string;
  items: Image[];
}

export class CurateWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      collectionsMeta: [],
      items: [],
      collectionId: this.props.match?.params?.id || null,
    };
  }

  imageFileInfo: ImageFileInfo;
  slicesData: Slices;

  componentDidMount() {
    if (this.props.etebaseInstance) {
      if (this.state.collectionId) {
        console.log("getting items!");
        this.props.etebaseInstance
          .getImagesMeta(this.state.collectionId)
          .then((items): void => {
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
            console.log(collectionsMeta);
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
    if (prevProps.match.path !== this.props.match.path) {
      // If we've changed route, definitely update
      const collectionId = this.props.match?.params?.id;
      if (collectionId) {
        this.props.etebaseInstance
          .getImagesMeta(collectionId)
          .then((items): void => {
            this.setState({ items });
            this.setState({ collectionId });
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

  setUploadedImage = async (
    imageFileInfo: ImageFileInfo,
    slicesData: Slices
  ): Promise<void> => {
    this.imageFileInfo = imageFileInfo;
    this.slicesData = slicesData;
    this.props.etebaseInstance
      .createCollection("temp-gallery")
      .then((uid) => {
        this.props.etebaseInstance.createImage(uid, this.slicesData);
      })
      .catch((e) => console.log(e));
  };

  render = (): ReactNode => {
    if (this.props.etebaseInstance) {
      return (
        <div>
          <UploadImage
            setUploadedImage={this.setUploadedImage}
            spanElement={<span>Upload</span>}
            multiple
          />
          <h3>Collections:</h3>
          {this.state.collectionsMeta
            ? this.state.collectionsMeta.map((col) => (
                <span key={col.uid}>
                  <Link to={`/curate/${col.uid}`}>{col.name}</Link>
                  <br />
                </span>
              ))
            : null}

          <h3>Items</h3>
          {this.state.items.map((item) => (
            <span key={item.uid}>
              <Link to={`/annotate/${this.state.collectionId}/${item.uid}`}>
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
