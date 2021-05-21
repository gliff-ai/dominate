import React, { Component, ReactNode } from "react";
import { UserInterface as Manage } from "@gliff-ai/manage";

import { DominateEtebase, Collection, Item, Gallery, Image } from "@/etebase";
import {useAuth} from "@/hooks/use-auth";

interface Props {
  etebaseInstance: DominateEtebase;
}

export const ManageWrapper = (props: Props) => {
  const auth = useAuth();

  console.log(auth)
  // componentDidUpdate(prevProps: Props) {
  //   if (prevProps.match.path !== this.props.match.path) {
  //     // If we've changed route, definitely update
  //     const collectionId = this.props.match?.params?.id;
  //     if (collectionId) {
  //       this.props.etebaseInstance
  //         .getImagesMeta(collectionId)
  //         .then((items): void => {
  //           this.setState({ items });
  //           this.setState({ collectionId });
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     } else {
  //       this.props.etebaseInstance
  //         .getCollectionsMeta("gliff.gallery")
  //         .then((collectionsMeta) => this.setState({ collectionsMeta }))
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     }
  //   }
  // }
  const user = {email: auth.user.username, authToken: auth.user.authToken}
  // return !props.etebaseInstance ? null : <Manage user={auth.user} />;
  return !props.etebaseInstance ? null : <Manage />;
  return !props.etebaseInstance ? null : <h1>MANAGE</h1>;
};
