import { ReactElement, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import CookieConsent from "react-cookie-consent";
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
  MessageAlert,
  NavBar,
  PageSpinner,
  ProgressSnackbar,
  Task,
} from "@/components";
import { BasicPage } from "@/views/BasicPage";
import { PrivateRoute } from "./wrappers/PrivateRouter";

interface Props {
  storeInstance: DominateStore;
}

const UserInterface = (props: Props): ReactElement | null => {
  const { storeInstance } = props;
  const [task, setTask] = useState<Task>({
    isLoading: false,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCookiesConsented, setIsCookiesConsented] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <ProgressSnackbar task={task} setTask={setTask} />
      <CssBaseline />
      <BrowserRouter>
        <div style={{ height: "100%", overflow: "auto" }}>
          <PageSpinner isLoading={isLoading} />
          <NavBar />
          <MessageAlert severity="error" message={isCookiesConsented} />
          <Routes>
            <Route path="/signin">
              <BasicPage view={<SignIn />} title={<>Login</>} />
            </Route>
            <Route path="/signup">
              <BasicPage view={<SignUp />} title={<>Create an Account</>} />
            </Route>
            <Route path="/signup/success">
              <BasicPage
                view={<SignUp state="4-VerificationSent" />}
                title={<>Verify Email</>}
              />
            </Route>
            <Route path="/signup/failure">
              <BasicPage
                view={<SignUp state="3-BillingFailed" />}
                title={<>Payment Failed</>}
              />
            </Route>
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
              element={
                <BasicPage
                  view={<ResetPassword storeInstance={storeInstance} />}
                  title={<>Change Password</>}
                  showBackButton
                />
              }
            />
            <PrivateRoute path="/account">
              <Account />
            </PrivateRoute>
            <PrivateRoute path="/billing">
              <Billing />
            </PrivateRoute>
          </Routes>
        </div>
      </BrowserRouter>

      <CookieConsent
        location="bottom"
        cookieName="gliff-ai-consent-cookie"
        expires={999}
        overlay
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
        buttonStyle={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.text.primary,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "15px",
          width: "169px",
          marginBottom: "20px",
          marginTop: "20px",
          borderRadius: "9px",
        }}
        declineButtonStyle={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.text.primary,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "15px",
          width: "169px",
          marginBottom: "20px",
          marginTop: "20px",
          borderRadius: "9px",
        }}
        enableDeclineButton
        setDeclineCookie={false}
        onDecline={() => {
          setIsCookiesConsented(
            "Without cookies this app will not work, redirecting you to our homepage."
          );
          setTimeout(() => window.location.replace("https://gliff.ai"), 1500);
        }}
      >
        This website uses cookies to enhance the user experience (we don&apos;t
        use tracking or advertising cookies).
      </CookieConsent>
    </ThemeProvider>
  );
};

export default UserInterface;
