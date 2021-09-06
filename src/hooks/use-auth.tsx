import axios from "axios";
import { useState, useEffect, useContext, createContext } from "react";
import { DominateStore } from "@/store";
import { User, UserProfile } from "@/services/user/interfaces";
import { createUserProfile, getUserProfile } from "@/services/user";

interface Props {
  children: React.ReactElement;
  storeInstance: DominateStore;
}

interface Context {
  user: User;
  userProfile: UserProfile;
  ready: boolean;
  getInstance: () => DominateStore;
  changePassword: (newPassword: string) => Promise<boolean>;
  signin: (username: string, password: string) => Promise<User>;
  signout: () => Promise<boolean>;
  signup: (username: string, password: string) => Promise<User>;
  createProfile: (
    name: string,
    teamId?: number,
    inviteId?: string,
    acceptedTermsAndConditions?: boolean
  ) => Promise<{ profile: UserProfile; recoveryKey: string[] }>;
}

const authContext = createContext<Context>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth(storeInstance: DominateStore) {
  const [user, setUser] = useState<User>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [ready, setReady] = useState<boolean>(false);

  // Wrapper to the set hook to add the auth token
  const updateUser = (authedUser: User | null) => {
    if (authedUser) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      axios.defaults.headers.common.Authorization = `Token ${authedUser.authToken}`;
    }

    setUser(authedUser);
    if (authedUser) {
      void getUserProfile().then(
        (profile) => {
          console.log("UPDATING USER");
          console.log(profile);
          setUserProfile(profile);
          setReady(true);
        },
        () => {
          // 401 / 403 error, so clear saved session:
          localStorage.removeItem("storeInstance");
          setReady(true);
        }
      );
    } else {
      setUserProfile(null);
    }
  };

  const getInstance = (): DominateStore => storeInstance;

  const signin = (username, password): Promise<User> =>
    storeInstance.login(username, password).then((storeUser) => {
      updateUser(storeUser);
      return storeUser;
    });

  const signup = (email, password): Promise<User> =>
    storeInstance.signup(email, password).then((storeUser) => {
      updateUser(storeUser);
      return storeUser;
    });

  const signout = (): Promise<boolean> =>
    storeInstance.logout().then((response) => {
      updateUser(null);
      return response;
    });

  const changePassword = (newPassword: string): Promise<boolean> =>
    storeInstance.changePassword(newPassword).then(signout);

  const createProfile = async (
    name: string,
    teamId: number,
    inviteId: string,
    acceptedTermsAndConditions: boolean
  ) => {
    if (!storeInstance.getUser()) return null;

    const { readable: recoveryKey, hashed } =
      storeInstance.generateRecoveryKey();

    const savedSession = await storeInstance.etebaseInstance.save(hashed);

    const profile = await createUserProfile(
      name,
      teamId,
      inviteId,
      acceptedTermsAndConditions,
      savedSession
    );

    return {
      profile,
      recoveryKey,
    };
  };

  // Login initially if we have a session
  useEffect(() => {
    storeInstance
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
    userProfile,
    ready,
    signin,
    signout,
    signup,
    createProfile,
    getInstance,
    changePassword,
  };
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
export function ProvideAuth(props: Props): React.ReactElement {
  const auth = useProvideAuth(props.storeInstance);
  return (
    <authContext.Provider value={auth}>{props.children}</authContext.Provider>
  );
}
