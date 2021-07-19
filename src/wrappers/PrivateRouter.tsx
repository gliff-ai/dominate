import { ReactElement } from "react";
import { Route, Navigate, RouteProps } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export const PrivateRoute = (props: RouteProps): ReactElement => {
  // const { children, ...rest } = props;
  const auth = useAuth();

  // if no authorised user at all
  // redirect to signin
  if (!auth?.user) {
    return <Navigate to="/signin" />;
  }

  // if no verified email
  // redirect to request verification email page
  if (
    !auth?.userProfile?.email_verified &&
    props.path !== "request-verify-email"
  ) {
    return <Navigate to="/request-verify-email" />;
  }

  // default to just following the route
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Route {...props} />;
};
