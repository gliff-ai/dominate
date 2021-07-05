import { Component, ReactElement, ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider, WithStyles, withStyles } from "@material-ui/core";
import { theme } from "@/theme";

import { DominateEtebase } from "@/etebase";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/SignUp";
import { RecoverAccount } from "@/views/RecoverAccount";
import { Navbar } from "@/NavBar";
import { ManageWrapper } from "@/ManageWrapper";
import { AnnotateWrapper } from "@/AnnotateWrapper";
import { RequestRecoverAccount } from "@/views/RequestRecovery";
import { Home } from "./Home";
import { CurateWrapper } from "./CurateWrapper";
import { RecoveryKey } from "./views/RecoveryKey";
import { TeamMembers } from "./views/TeamMembers";
import { Account } from "./views/Account";
import { ResetPassword } from "./views/ResetPassword";

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
}

const UserInterface = (props: Props): ReactElement | null => {
  const { classes, etebaseInstance } = props;
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
            <Navbar />
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route
              path="curate/:id"
              element={<CurateWrapper etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="curate/"
              element={<CurateWrapper etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="annotate/:collectionUid/:imageUid"
              element={<AnnotateWrapper etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="manage/*"
              element={<ManageWrapper etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="recover/*"
              element={<RecoverAccount etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="request-recover/*"
              element={<RequestRecoverAccount />}
            />
            <Route path="/">
              <Home />
            </Route>

            <Route path="/teammembers">
              <TeamMembers />
            </Route>

            <Route
              path="/reset-password"
              element={<ResetPassword etebaseInstance={etebaseInstance} />}
            />

            <Route path="/account">
              <Account />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default withStyles(styles)(UserInterface);
