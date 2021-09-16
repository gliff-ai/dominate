import { ReactElement, useState, useEffect } from "react";
import { Route, Navigate, RouteProps } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const PrivateRoute = (props: RouteProps): ReactElement | null => {
  const auth = useAuth();
  const [element, setElement] = useState<ReactElement>(<></>);

  useEffect(() => {
    // catch the situation where the effect
    // has switched from true to false
    // and just return (this shouldn't happen)
    if (!auth?.ready) {
      return;
    }

    // if no authorised user at all
    // redirect to signin
    if (!auth?.user) {
      setElement(<Navigate to="/signin" />);
    }

    // if no verified email
    // redirect to request verification email page
    else if (
      !auth?.userProfile?.email_verified &&
      props.path !== "request-verify-email"
    ) {
      setElement(<Navigate to="/request-verify-email" />);
    }
  }, [auth, props.path]);

  if (!auth) return null;

  // default to just following the route
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    (auth?.user && auth?.userProfile?.email_verified && <Route {...props} />) ||
    element
  );
};
