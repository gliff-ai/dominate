import React, { Component, ReactNode } from "react";
import {
  UserInterface as Annotate,
  Annotations,
  Slices,
} from "@gliff-ai/annotate";
import { ImageFileInfo } from "@gliff-ai/upload";
import { DominateEtebase, Item } from "@/etebase";
import { Image } from "@/etebase/interfaces";

interface Props {
  etebaseInstance?: DominateEtebase;
  match?: Match;
}

interface Match {
  path: string;
  params: {
    colId: string;
    imageId: string;
  };
}

interface State {
  annotationItems: Item[];
  image: Image;
}

export class AnnotateWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      image: null,
      annotationItems: null,
    };
  }

  componentDidMount = (): void => {
    this.setImage();
    this.setAnnotationItems();
  };

  componentDidUpdate = (prevProps: Props): void => {
    if (prevProps.match.path !== this.props.match.path) {
      this.setImage();
      this.setAnnotationItems();
    }
  };

  setImage = (): void => {
    // Set state for image.
    this.props.etebaseInstance
      .getImage(this.props.match.params.colId, this.props.match.params.imageId)
      .then((image) => {
        this.setState({ image });
      })
      .catch(() => console.log("Cannot retrieve image."));
  };

  setAnnotationItems = (): void => {
    // Set state for annotation items.
    this.props?.etebaseInstance
      .getAnnotationItems(
        this.props.match.params.colId,
        this.props.match.params.imageId
      )
      .then((annotationItems) => {
        this.setState({ annotationItems });
      })
      .catch(() => console.log("Cannot retrieve annotation."));
  };

  saveAnnotation = (annotationsObject: Annotations): void => {
    // Save annotations data in a new item.
    if (this.state.annotationItems.length === 0) {
      this.props.etebaseInstance
        .createAnnotation(
          this.props.match.params.colId,
          this.props.match.params.imageId,
          annotationsObject
        )
        .catch((e) => console.log(e));
    } else {
      this.props.etebaseInstance
        .updateAnnotation(
          this.props.match.params.colId,
          this.state.annotationItems[0],
          annotationsObject
        )
        .catch((e) => console.log(e));
    }
  };

  getImageFilInfo = (): ImageFileInfo | null => {
    // Reconstruct imageFileInfo from image's meta.
    if (this.state.image) {
      const { width, height, slices, channels } = this.state.image.meta;
      return new ImageFileInfo({
        fileName: this.state.image.name,
        width,
        height,
        num_slices: slices,
        num_channels: channels,
        size: width * height,
      });
    }
    return null;
  };

  getSlicesData = (): Slices[] | null => {
    // Get image slices data.
    if (this.state.image) {
      return this.state.image.content;
    }
    return null;
  };

  getAnnotationsObject = (): Annotations | null => {
    // Get annotationsObject from annotation's content.
    if (this.state.annotationItems.length !== 0) {
      const annotation: Annotations =
        this.state.annotationItems[0].getContent();
      return annotation;
    }
    return null;
  };

  render = (): ReactNode => {
    if (this.props.etebaseInstance) {
      return (
        <Annotate
          slicesData={this.getSlicesData()}
          imageFileInfo={this.getImageFilInfo()}
          annotationsObject={this.getAnnotationsObject()}
          saveAnnotationsCallback={this.saveAnnotation}
        />
      );
    }
    return null;
  };
}
