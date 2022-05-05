import { ReactElement, useState, useEffect } from "react";
import { Navigate, RouteProps } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const PrivateRoute = (props: RouteProps): ReactElement | null => {
  const auth = useAuth();
  const [element, setElement] = useState<ReactElement>(<></>);

  const { userProfileReady, loaded, user, userProfile } = auth || {};

  useEffect(() => {
    if (!loaded) {
      return;
    }

    // if no authorised user at all
    // redirect to signin
    if (!user) {
      setElement(<Navigate to="/signin" />);
    }

    // if no verified email
    // redirect to request verification email page
    else if (
      userProfile?.email_verified === false &&
      props.path !== "request-verify-email"
    ) {
      setElement(<Navigate to="/request-verify-email" />);
    }

    // We can render the route now
    if (loaded && userProfileReady && user) {
      setElement(<>props.element</>);
    }
  }, [userProfileReady, user, userProfile, loaded, props.path]);

  if (!auth) {
    return null;
  }

  // default to just following the route
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    (auth?.user && auth?.userProfile?.email_verified && <>{props.element}</>) ||
    element
  );
};
