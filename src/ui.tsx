/* eslint-disable react/jsx-curly-newline */
import React, { Component, ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WithStyles, withStyles } from "@material-ui/core";

import { Collection, DominateEtebase } from "@/etebase";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/signup/SignUp";
import { RecoverAccount } from "@/views/RecoverAccount";
import { Navbar } from "@/NavBar";
import { ManageWrapper } from "@/ManageWrapper";
import { AnnotateWrapper } from "@/AnnotateWrapper";
import { RequestRecoverAccount } from "@/views/RequestRecovery";
import { Home } from "./Home";
import { CurateWrapper } from "./CurateWrapper";

const styles = {
  outerContainer: { height: "100%" },
};

interface Props extends WithStyles<typeof styles> {
  etebaseInstance: DominateEtebase;
  // children?: Children;
}

interface State {
  collections?: Collection[];
}

class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { collections: null };
  }

  render = (): ReactNode => {
    const { classes } = this.props;
    return (
      <BrowserRouter>
        <div className={classes.outerContainer}>
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

            <Route
              path="recover/*"
              element={
                <RecoverAccount etebaseInstance={this.props.etebaseInstance} />
              }
            />

            <Route
              path="request-recover/*"
              element={<RequestRecoverAccount />}
            />

            <Route path="/">
              <Home />
            </Route>
          </Routes>
        </div>

        <footer>
          <div>
            {this.state.collections?.map((col) =>
              JSON.stringify(col.getMeta())
            )}
          </div>
        </footer>
      </BrowserRouter>
    );
  };
}

export default withStyles(styles)(UserInterface);
