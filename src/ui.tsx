import { ReactElement } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { makeStyles, ThemeProvider } from "@material-ui/core";
import { theme } from "@/theme";

import { DominateEtebase } from "@/etebase";
import { Annotate, Curate, Manage } from "@/wrappers";
import {
  Account,
  RecoverAccount,
  RequestRecoverAccount,
  ResetPassword,
  SignIn,
  SignUp,
} from "@/views";
import { NavBar } from "@/components";

const useStyles = makeStyles({
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
});

interface Props {
  etebaseInstance: DominateEtebase;
}

const UserInterface = (props: Props): ReactElement | null => {
  const { etebaseInstance } = props;
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div className={classes.outerContainer}>
          <Routes>
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route
              path="curate/:id"
              element={<Curate etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="curate/"
              element={<Curate etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="annotate/:collectionUid/:imageUid"
              element={<Annotate etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="manage/*"
              element={<Manage etebaseInstance={etebaseInstance} />}
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
              <Navigate to="/curate" />
            </Route>
            <Route
              path="/reset-password"
              element={<ResetPassword etebaseInstance={etebaseInstance} />}
            />
            <Route path="/account">
              <Account />
            </Route>
          </Routes>
          <NavBar />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default UserInterface;
