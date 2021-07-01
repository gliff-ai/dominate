/* eslint-disable react/jsx-curly-newline */
import React, { Component, ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Avatar,
  Card,
  CssBaseline,
  IconButton,
  Theme,
  ThemeProvider,
  Tooltip,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import { theme } from "@/theme";
import SVG from "react-inlinesvg";

import { Collection, DominateEtebase } from "@/etebase";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/SignUp";
import { RecoverAccount } from "@/views/RecoverAccounts";
import { Navbar } from "@/NavBar";
import { ManageWrapper } from "@/ManageWrapper";
import { AnnotateWrapper } from "@/AnnotateWrapper";
import { RequestRecoverAccount } from "@/views/RequestRecovery";
import { Home } from "./Home";
import { CurateWrapper } from "./CurateWrapper";
import { RecoveryKey } from "./views/RecoveryKey";
import { TeamMembers } from "./views/TeamMembers";

const styles = {
  outerContainer: { height: "100%" },
  home: {
    height: "53px",
    backgroundColor: theme.palette.primary.light,
    width: "61px",
    top: "20px",
    right: "20px",
  },
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "21px",
  },

  iconButton: {
    marginLeft: "-20px",
  },
  avatarSVG: {
    backgroundColor: theme.palette.primary.light,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "6px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
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
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <div className={classes.outerContainer}>
            <Routes>
              {window.location.pathname === "/signin" ||
              window.location.pathname === "/signup" ? (
                <></>
              ) : (
                <Navbar />
              )}
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
                  <AnnotateWrapper
                    etebaseInstance={this.props.etebaseInstance}
                  />
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
                  <RecoverAccount
                    etebaseInstance={this.props.etebaseInstance}
                  />
                }
              />

              <Route
                path="request-recover/*"
                element={<RequestRecoverAccount />}
              />
              <Route path="/">
                <Home />
              </Route>
              <Route path="/recoveraccount">
                <RecoverAccount />
              </Route>
              <Route path="/recoverykey">
                <RecoveryKey />
              </Route>
              <Route path="/teammembers">
                <TeamMembers />
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
      </ThemeProvider>
    );
  };
}

export default withStyles(styles)(UserInterface);
