import { ReactElement, useState, useEffect } from "react";
import { Route, Navigate, RouteProps } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export const PrivateRoute = (props: RouteProps): ReactElement => {
  const auth = useAuth();
  const [element, setElement] = useState<ReactElement | null>(null);

  useEffect(() => {
    // default to just following the route
    if (auth) {
      // eslint-disable-next-line react/jsx-props-no-spreading
      setElement(<Route {...props} />);
    }
    // if no authorised user at all
    // redirect to signin
    else if (!auth?.user) {
      console.log("here");
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
  }, [auth]);

  return element;
};
