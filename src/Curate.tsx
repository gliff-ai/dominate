import React, { Component, ReactNode } from "react";
import { DominateEtebase, Collection, Item, Gallery } from "@/etebase";
import { Link } from "react-router-dom";

interface Props {
  etebaseInstance?: DominateEtebase;
  selectedThing: (thingType: string, thing: Collection | Item) => void;
  match: {
    path: string;
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
    console.log(this.props)
    console.log(this.state.collectionId);
    if (this.props.etebaseInstance) {
      if (this.state.collectionId) {
        console.log("getting items!")
        this.props.etebaseInstance.getImagesMeta(this.state.collectionId).then((items) => {
          console.log(items);
          this.setState({ items });
        });
      } else {
        // No id, get all collections
        console.log("getting galleries!")
        this.props.etebaseInstance
          .getCollectionsMeta("gliff.gallery")
          .then((collectionsMeta) => {
            console.log(collectionsMeta);
            this.setState({ collectionsMeta });
          });
      }
    } else {
      console.log("getting nothing!")
    }
  }

  async componentDidUpdate(prevProps: Props) {
    console.log("did update curate")
    if (prevProps.match.path !== this.props.match.path) { // If we've changed route, definitely update
      const collectionId = this.props.match?.params?.id ;
      if (collectionId) {
        this.props.etebaseInstance.getImagesMeta(collectionId).then((items) => {
          this.setState({ items });
          this.setState({collectionId})
        });
      } else {
        const collectionsMeta = await this.props.etebaseInstance.getCollectionsMeta(
          "gliff.gallery"
        );
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
                <Link to={`/curate/${col.uid}`}>{col.name}</Link>
                <br />
              </span>
            );
          })}


          <h3>Items</h3>
          {this.state.items.map(item => {
            return (<span key={item.uid}>
              <Link to={`/annotate/${item.uid}`}>{item.name}</Link>
            </span>)
          })}
        </div>
      );
    } else {
      return null;
    }
  };
}
