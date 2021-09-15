import { ReactElement, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate, useRoutes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
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

const UserInterface = (props: Props): ReactElement | null => {
  const { storeInstance } = props;
  const [task, setTask] = useState<Task>({
    isLoading: false,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);


  const RoutesElement = () => useRoutes([
    // These are the same as the props you provide to <Route>
    { path: "/", element: <h1>home!</h1> },
    { path: "signin", element: <SignIn /> },
    // {
    //   path: "invoices",
    //   element: <Invoices />,
    //   // Nested routes use a children property, which is also
    //   // the same as <Route>
    //   children: [
    //     { path: ":id", element: <Invoice /> },
    //     { path: "sent", element: <SentInvoices /> }
    //   ]
    // },
    // // Not found routes work as you'd expect
    { path: "*", element: <h1>NotFound </h1> }
  ]);

  return (
    <ThemeProvider theme={theme}>
      <h1> in theme </h1>
      <ProgressSnackbar task={task} setTask={setTask} />
      <CssBaseline />
      <BrowserRouter>
      <h1> in router </h1>
        <div style={{ height: "100%", overflow: "auto" }}>
          <PageSpinner isLoading={isLoading} />
          <NavBar />
          <Routes>
          {RoutesElement}
        </Routes>
        </div>
      </BrowserRouter>
      <CookieConsent />
    </ThemeProvider>
  );
};

export default UserInterface;
