import { ReactElement, useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider,makeStyles } from "@material-ui/core";
import { CollectionsOutlined } from "@material-ui/icons";
import { theme } from "@gliff-ai/style";
import { DominateStore } from "@/store";
import { Annotate, Audit, Curate, Manage } from "@/wrappers";
import {
  Account,
  RecoverAccount,
  RequestRecoverAccount,
  ResetPassword,
  SignIn,
  SignUp,
  VerifyEmail,
  RequestEmailVerification,
  Billing,
} from "@/views";
import {
  NavBar,
  PageSpinner,
  ProgressSnackbar,
  Task,
  CookieConsent,
} from "@/components";
import { BasicPage } from "@/views/BasicPage";
import { PrivateRoute } from "./wrappers/PrivateRouter";


interface Props {
  storeInstance: DominateStore;
}

const useStyles = makeStyles(() => ({
  overflow: {
    height: "calc(100% - 90px)",
     overflow:"auto"
  },
  noOverflow: {
    height: "calc(100% - 90px)",
    overflow: "hidden"
  }
}));

const UserInterface = (props: Props): ReactElement | null => {
  const { storeInstance } = props;
  const [task, setTask] = useState<Task>({
    isLoading: false,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [isOverflow, setIsOverflow] = useState(true);

  useEffect(() => {
    // Paths we never scroll on because it messes with canvases etc
    const noScroll = ["annotate"];
    const shouldOverflow = (pathname: string): boolean =>
      noScroll.reduce((o, path) => {
        if (pathname.includes(path) || !o) {
          return false;
        }
        return true;
      }, true);
    setIsOverflow(shouldOverflow(location.pathname));
  }, [location]);

  const classes = useStyles(isOverflow);

  return (
    <ThemeProvider theme={theme}>
      <ProgressSnackbar task={task} setTask={setTask} />
      <CssBaseline />
      <NavBar />
      <div className={isOverflow ? classes.overflow : classes.noOverflow}>
        <PageSpinner isLoading={isLoading} />
        <Routes>
          <Routes>
            <Route
              path="signin"
              element={<BasicPage view={<SignIn />} title={<>Login</>} />}
            />
            <Route
              path="signup"
              element={
                <BasicPage view={<SignUp />} title={<>Create an Account</>} />
              }
            />
            <Route
              path="signup/success"
              element={
                <BasicPage
                  view={<SignUp state="4-VerificationSent" />}
                  title={<>Verify Email</>}
                />
              }
            />

            <Route
              path="signup/failure"
              element={
                <BasicPage
                  view={<SignUp state="3-BillingFailed" />}
                  title={<>Payment Failed</>}
                />
              }
            />

            <PrivateRoute
              path="curate/:collectionUid"
              element={
                <Curate
                  storeInstance={storeInstance}
                  setIsLoading={setIsLoading}
                  setTask={setTask}
                />
              }
            />
            <PrivateRoute
              path="annotate/:collectionUid/:imageUid"
              element={
                <Annotate
                  storeInstance={storeInstance}
                  setIsLoading={setIsLoading}
                />
              }
            />
            <PrivateRoute
              path="manage/*"
              element={<Manage storeInstance={storeInstance} />}
            />
            <PrivateRoute
              path="audit/:collectionUid"
              element={
                <Audit
                  storeInstance={storeInstance}
                  // setIsLoading={setIsLoading}
                />
              }
            />
            <Route
              path="recover/*"
              element={
                <BasicPage
                  view={<RecoverAccount storeInstance={storeInstance} />}
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
                  showBackButton
                />
              }
            />
            <Route
              path="verify_email/:uid"
              element={
                <BasicPage
                  view={<VerifyEmail />}
                  title={<>Verify Email Address</>}
                />
              }
            />

            <Route
              path="request-verify-email"
              element={
                <BasicPage
                  view={<RequestEmailVerification />}
                  title={<>Request Email Verification</>}
                />
              }
            />

            <PrivateRoute path="" element={<Navigate to="manage/projects" />} />

            <PrivateRoute
              path="reset-password"
              element={
                <BasicPage
                  view={<ResetPassword storeInstance={storeInstance} />}
                  title={<>Change Password</>}
                  showBackButton
                />
              }
            />
            <PrivateRoute path="account" element={<Account />} />

            <PrivateRoute path="billing" element={<Billing />} />
          </Routes>
        </Routes>
      </div>

      <CookieConsent />
    </ThemeProvider>
  );
};

export default UserInterface;
