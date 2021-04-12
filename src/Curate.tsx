import React, { Component, ReactNode } from "react";
import { DominateEtebase, Collection, Item, Gallery } from "@/etebase";

interface Props {
  etebaseInstance?: DominateEtebase;
  selectedThing: (thingType: string, thing: Collection | Item) => void;
  match: {
    params: {
      id: string
    }
  };
}

export class Curate extends Component<Props> {
  props: Props;

  state: {
    collectionsMeta: Gallery[];
    items: any[];
    collectionId?: string;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      collectionsMeta: [],
      items: [],
      collectionId: this.props.match?.params?.id || null
    };
  }

  componentDidMount() {

    console.log(this.state.collectionId);
    if (this.props.etebaseInstance) {
      if (this.state.collectionId) {
        this.props.etebaseInstance.getImagesMeta(this.state.collectionId).then((items) => {
          console.log(items);
          this.setState({ items });
        });
      } else {
        // No id, get all collections

        this.props.etebaseInstance
          .getCollectionsMeta("gliff.gallery")
          .then((collectionsMeta) => {
            console.log(collectionsMeta);
            this.setState({ collectionsMeta });
          });
      }
    }
  }

  async componentDidUpdate(prevProps: Props) {
    if (!prevProps.etebaseInstance) {
      if (this.state.collectionId) {
        this.props.etebaseInstance.getImagesMeta(this.state.collectionId).then((items) => {
          console.log(items);
          this.setState({ items });
        });
      } else {
        const collectionsMeta = await this.props.etebaseInstance.getCollectionsMeta(
          "gliff.gallery"
        );
        console.log(collectionsMeta);
        this.setState({ collectionsMeta });
      }
    }
  }

  render = (): ReactNode => {
    if (this.props.etebaseInstance) {
      return (
        <div>
          <h1>Curate</h1>

          <h3>Collections:</h3>
          {this.state.collectionsMeta.map((col) => {
            return (
              <span key={col.uid}>
                <a href={`/curate/${col.uid}`}>{col.name}</a>
                <br />
              </span>
            );
          })}


          <h3>Items</h3>
          {this.state.items.map(item => {
            return (<span key={item.uid}>
              <a href={`/annotate/${item.uid}`}>{item.name}</a>
            </span>)
          })}
        </div>
      );
    } else {
      return null;
    }
  };
}
