import React, { useState, useEffect, useContext, createContext } from "react";
import { DominateEtebase, Collection, Item, Gallery } from "@/etebase";

const authContext = createContext(null);

interface Props {
  children: React.ReactElement;
  etebaseInstance: DominateEtebase;
}

interface User {
  username: string;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth(etebaseInstance: DominateEtebase) {
  console.log("Use provide auth!");
  console.log(etebaseInstance);

  const [user, setUser] = useState<User>(null);

  const signin = (username, password): Promise<User> => {
    return etebaseInstance.login(username, password).then((etebaseUser) => {
      console.log("LOGGGED IN?!?!?!?");
      console.log(true);
      setUser(etebaseUser);
      return etebaseUser;
    });
  };

  const signout = () =>
    etebaseInstance.logout().then(() => {
      setUser(null);
    });
  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    // const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
    //   if (user) {
    //     setUser(user);
    //   } else {
    //     setUser(false);
    //   }
    // });
    // Cleanup subscription on unmount
    // return () => unsubscribe();
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
