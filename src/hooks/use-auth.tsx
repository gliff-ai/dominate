import React, { useState, useEffect, useContext, createContext } from "react";
import { DominateEtebase, API_URL } from "@/etebase";

interface Props {
  children: React.ReactElement;
  etebaseInstance: DominateEtebase;
}

interface User {
  username: string;
  authToken: string;
}

interface Context {
  user: User;
  signin: (username: string, password: string) => Promise<User>;
  signout: () => Promise<boolean>;
  signup: (username: string, password: string) => Promise<User>;
  createProfile: (name: string) => Promise<Response>; // TODO add return type
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

  const signup = (email, password): Promise<User> =>
    etebaseInstance.signup(email, password).then((etebaseUser) => {
      setUser(etebaseUser);
      return etebaseUser;
    });

  const signout = (): Promise<boolean> =>
    etebaseInstance.logout().then((response) => {
      setUser(null);
      return response;
    });

  const createProfile = (name: string) => {
    const u = etebaseInstance.getUser();

    if(!u) return null;

    // Handle creating recovery key here!
    return fetch(`${API_URL}/user/`, {
      method: "POST",
      headers: { Authorization: `Token ${u.authToken}` },
      body: JSON.stringify({
        name,
      }),
    });
  };

  // Login initially if we have a session
  useEffect(() => {
    etebaseInstance
      .init()
      .then((authedUser) => {
        if (authedUser) {
          setUser(authedUser);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Return the user object and auth methods
  return {
    user,
    signin,
    signout,
    signup,
    createProfile,
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
