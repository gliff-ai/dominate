/* eslint-disable react/jsx-curly-newline */
import React, { Component, ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Collection, DominateEtebase } from "@/etebase";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/signup/SignUp";
import { Navbar } from "@/NavBar";
import { ManageWrapper } from "@/ManageWrapper";
import { AnnotateWrapper } from "@/AnnotateWrapper";
import { Home } from "./Home";
import { CurateWrapper } from "./CurateWrapper";

interface Props {
  etebaseInstance: DominateEtebase;
  // children?: Children;
}

interface State {
  collections?: Collection[];
}

export class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { collections: null };
  }

  render = (): ReactNode => (
    <BrowserRouter>
      <div>
        <Navbar />

        <br />
        <br />
        <br />

        <Routes>
          <Route path="/signin">
            <SignIn />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route
            path="curate/:id"
            element={
              <CurateWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route
            path="curate/"
            element={
              <CurateWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route
            path="annotate/:collectionUid/:imageUid"
            element={
              <AnnotateWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route
            path="manage/*"
            element={
              <ManageWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route path="/">
            <Home />
          </Route>
        </Routes>
      </div>

      <footer>
        <div>
          {this.state.collections?.map((col) => JSON.stringify(col.getMeta()))}
        </div>
      </footer>
    </BrowserRouter>
  );
}
