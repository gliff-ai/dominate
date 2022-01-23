import { ReactElement, useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
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
  UnsupportedScreenSizeErrorPage,
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
import { usePrompt } from "./hooks/use-blocker";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


interface Props {
  storeInstance: DominateStore;
}

const useStyles = makeStyles(() => ({
  overflow: {
    height: "calc(100% - 90px)",
    overflow: "auto",
  },
  noOverflow: {
    height: "calc(100% - 90px)",
    overflow: "hidden",
  },
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
  const [productSection, setProductSection] =
    useState<JSX.Element | null>(null);

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

  useEffect(() => {
    if (!productSection) return;
    setProductSection(null); // clear product section
  }, [window.location.pathname]);

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const classes = useStyles(isOverflow);

  usePrompt(
    "Operations are still pending, are you sure you want to leave the page?",
    task.isLoading
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {dimensions.width < 700 || dimensions.height < 300 ? (
          <BasicPage
            view={<UnsupportedScreenSizeErrorPage />}
            title={<>Oops!</>}
          />
        ) : (
          <>
            <ProgressSnackbar task={task} setTask={setTask} />
            <CssBaseline />
            <NavBar productSection={productSection} />
            <div className={isOverflow ? classes.overflow : classes.noOverflow}>
              <PageSpinner isLoading={isLoading} />

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

                <Route
                  path="curate/:collectionUid"
                  element={
                    <PrivateRoute
                      element={
                        <Curate
                          storeInstance={storeInstance}
                          setIsLoading={setIsLoading}
                          task={task}
                          setTask={setTask}
                        />
                      }
                    />
                  }
                />
                <Route
                  path="annotate/:collectionUid/:imageUid"
                  element={
                    <PrivateRoute
                      element={
                        <Annotate
                          storeInstance={storeInstance}
                          setIsLoading={setIsLoading}
                          task={task}
                          setTask={setTask}
                          setProductSection={setProductSection}
                        />
                      }
                    />
                  }
                />
                <Route
                  path="manage/*"
                  element={
                    <PrivateRoute
                      element={<Manage storeInstance={storeInstance} />}
                    />
                  }
                />
                <Route
                  path="audit/:collectionUid"
                  element={
                    <PrivateRoute
                      element={
                        <Audit
                          storeInstance={storeInstance}
                          // setIsLoading={setIsLoading}
                        />
                      }
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

                <Route
                  path="/"
                  element={
                    <PrivateRoute element={<Navigate to="manage/projects" />} />
                  }
                />

                <Route
                  path="reset-password"
                  element={
                    <PrivateRoute
                      element={
                        <BasicPage
                          view={<ResetPassword storeInstance={storeInstance} />}
                          title={<>Change Password</>}
                          showBackButton
                        />
                      }
                    />
                  }
                />
                <Route
                  path="account"
                  element={<PrivateRoute element={<Account />} />}
                />

                <Route
                  path="billing"
                  element={<PrivateRoute element={<Billing />} />}
                />
              </Routes>
            </div>
            <CookieConsent />
          </>
        )}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default UserInterface;
