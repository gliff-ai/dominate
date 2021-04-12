import React, { useState, useEffect, useContext, createContext } from "react";
import { DominateEtebase } from "@/etebase";

interface Props {
  children: React.ReactElement;
  etebaseInstance: DominateEtebase;
}

interface User {
  username: string;
}

interface Context {
  user: User;
  signin: (username: string, password: string) => Promise<User>;
  signout: () => Promise<boolean>;
}

const authContext = createContext<Context>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth(etebaseInstance: DominateEtebase) {
  const [user, setUser] = useState<User>(null);

  const signin = (username, password): Promise<User> =>
    etebaseInstance.login(username, password).then((etebaseUser) => {
      setUser(etebaseUser);
      return etebaseUser;
    });

  const signout = (): Promise<boolean> =>
    etebaseInstance.logout().then((response) => {
      setUser(null);
      return response;
    });

  // Login initally if we have a session
  useEffect(() => {
    void etebaseInstance.init().then((authedUser) => {
      if (authedUser) {
        setUser(authedUser);
      } else {
        setUser(null);
      }
    });
  }, []);

  // Return the user object and auth methods
  return {
    user,
    signin,
    signout,
  };
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
export function ProvideAuth(props: Props): React.ReactElement {
  const auth = useProvideAuth(props.etebaseInstance);
  return (
    <authContext.Provider value={auth}>{props.children}</authContext.Provider>
  );
}
