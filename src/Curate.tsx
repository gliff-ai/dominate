import React, { Component, ReactNode } from "react";
import { DominateEtebase, Collection, Item, Gallery } from "@/etebase";

interface Props {
  etebaseInstance?: DominateEtebase;
  selectedThing: (thingType: string, thing: Collection | Item) => void;
  match?: any;
  location?: any;
  history?: any;
}

export class Curate extends Component<Props> {
  props: Props;
  state: {
    collectionsMeta: Gallery[];
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      collectionsMeta: [],
    };
  }

  componentDidMount() {
    console.log("MOUNTED")
    console.log(this.props);
    if (this.props.etebaseInstance) {
      this.props.etebaseInstance
        .getCollectionsMeta()
        .then((collectionsMeta) => {
          console.log(collectionsMeta);
          this.setState({ collectionsMeta });
        });
    }
  }

  async componentDidUpdate(prevProps: Props) {
    if (!prevProps.etebaseInstance) {
      const collectionsMeta = await this.props.etebaseInstance.getCollectionsMeta();
      console.log(collectionsMeta);
      this.setState({ collectionsMeta });
    }
  }

  render = (): ReactNode => {
    if (this.props.etebaseInstance) {
      return (
        <div>
          <h1>Curate</h1>
          {this.state.collectionsMeta.map(col => {
              console.log(col)
              return <span><a href={col.uid}>{col.name}</a><br /></span>;
          })}
        </div>
      );
    } else {
      return null;
    }
  };
}
