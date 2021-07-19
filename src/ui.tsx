import { ReactElement, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { CssBaseline, makeStyles, ThemeProvider } from "@material-ui/core";
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
  VerifyEmail,
  RequestEmailVerification,
} from "@/views";
import { NavBar, PageSpinner, ProgressSnackbar, Task } from "@/components";
import { BasicPage } from "@/views/BasicPage";
import { PrivateRoute } from "./wrappers/PrivateRouter";

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
  const [task, setTask] = useState<Task>({
    isLoading: false,
    description: "",
  });
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <ProgressSnackbar task={task} setTask={setTask} />
      <CssBaseline />
      <BrowserRouter>
        <div className={classes.outerContainer}>
          <PageSpinner isLoading={isLoading} />
          <NavBar />
          <Routes>
            <Route path="/signin">
              <BasicPage view={<SignIn />} title={<>Login</>} />
            </Route>
            <Route path="/signup">
              <BasicPage view={<SignUp />} title={<>Create an Account</>} />
            </Route>
            <PrivateRoute
              path="curate/:id"
              element={
                <Curate
                  etebaseInstance={etebaseInstance}
                  setIsLoading={setIsLoading}
                  setTask={setTask}
                />
              }
            />
            <PrivateRoute
              path="curate/"
              element={
                <Curate
                  etebaseInstance={etebaseInstance}
                  setIsLoading={setIsLoading}
                  setTask={setTask}
                />
              }
            />
            <PrivateRoute
              path="annotate/:collectionUid/:imageUid"
              element={
                <Annotate
                  etebaseInstance={etebaseInstance}
                  setIsLoading={setIsLoading}
                />
              }
            />
            <PrivateRoute
              path="manage/*"
              element={<Manage etebaseInstance={etebaseInstance} />}
            />
            <Route
              path="recover/*"
              element={
                <BasicPage
                  view={<RecoverAccount etebaseInstance={etebaseInstance} />}
                  title={<>Recover my Account</>}
                />
              }
            />
            <Route
              path="request-recover/*"
              element={
                <BasicPage
                  view={<RequestRecoverAccount />}
                  title={<>Request Recovery</>}
                />
              }
            />
            <Route path="/verify_email/:uid">
              <BasicPage
                view={<VerifyEmail />}
                title={<>Verify Email Address</>}
              />
            </Route>
            <Route
              path="request-verify-email"
              element={
                <BasicPage
                  view={<RequestEmailVerification />}
                  title={<>Request Email Verification</>}
                />
              }
            />

            <PrivateRoute path="/">
              <Navigate to="/manage" />
            </PrivateRoute>

            <PrivateRoute
              path="/reset-password"
              element={<ResetPassword etebaseInstance={etebaseInstance} />}
            />
            <PrivateRoute path="/account">
              <Account />
            </PrivateRoute>
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default UserInterface;
