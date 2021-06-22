import axios from "axios";
import React, { useState, useEffect, useContext, createContext } from "react";
import { DominateEtebase } from "@/etebase";
import { User, UserProfile } from "@/services/user/interfaces";
import { createUserProfile } from "@/services/user";

interface Props {
  children: React.ReactElement;
  etebaseInstance: DominateEtebase;
}

interface Context {
  user: User;
  getInstance: () => DominateEtebase;
  signin: (username: string, password: string) => Promise<User>;
  signout: () => Promise<boolean>;
  signup: (username: string, password: string) => Promise<User>;
  createProfile: (
    name: string,
    teamId?: number,
    inviteId?: string
  ) => Promise<UserProfile>; // TODO add return type
}

const authContext = createContext<Context>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth(etebaseInstance: DominateEtebase) {
  const [user, setUser] = useState<User>(null);

  // Wrapper to the set hook to add the auth token
  const updateUser = (authedUser: User | null): void => {
    if (authedUser) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      axios.defaults.headers.common.Authorization = `Token ${authedUser.authToken}`;
    }

    setUser(authedUser);
  };

  const getInstance = (): DominateEtebase => etebaseInstance;

  const signin = (username, password): Promise<User> =>
    etebaseInstance.login(username, password).then((etebaseUser) => {
      updateUser(etebaseUser);
      return etebaseUser;
    });

  const signup = (email, password): Promise<User> =>
    etebaseInstance.signup(email, password).then((etebaseUser) => {
      updateUser(etebaseUser);
      return etebaseUser;
    });

  const signout = (): Promise<boolean> =>
    etebaseInstance.logout().then((response) => {
      updateUser(null);
      return response;
    });

  const createProfile = (name: string, teamId: number, inviteId: string) => {
    if (!etebaseInstance.getUser()) return null;

    // TODO: Handle creating recovery key here!
    return createUserProfile(name, teamId, inviteId);
  };

  // Login initially if we have a session
  useEffect(() => {
    etebaseInstance
      .init()
      .then((authedUser) => {
        if (authedUser) {
          updateUser(authedUser);
        } else {
          updateUser(null);
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
    getInstance,
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
