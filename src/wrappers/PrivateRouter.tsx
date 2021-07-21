import { ReactElement, useState, useEffect } from "react";
import { Route, Navigate, RouteProps } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export const PrivateRoute = (props: RouteProps): ReactElement => {
  const auth = useAuth();
  const [element, setElement] = useState<ReactElement>(<></>);
  const [hasLoaded, setHasLoaded] = useState(false);

  setTimeout(() => setHasLoaded(true), 2000);

  useEffect(() => {
    if (!hasLoaded) return;
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
  }, [hasLoaded]);

  // default to just following the route
  // eslint-disable-next-line react/jsx-props-no-spreading
  return (auth?.user && <Route {...props} />) || element;
};
