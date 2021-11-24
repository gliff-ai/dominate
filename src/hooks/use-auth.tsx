import axios from "axios";
import { useState, useContext, createContext } from "react";
import { DominateStore } from "@/store";
import { User, UserProfile } from "@/services/user/interfaces";
import { createUserProfile, getUserProfile } from "@/services/user";
import { useMountEffect } from "./use-mountEffect";

interface Props {
  children: React.ReactElement;
  storeInstance: DominateStore;
}

interface Context {
  user: User | null;
  userProfile: UserProfile | null;
  ready: boolean;
  isOwner: boolean;
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
  ) => Promise<{ profile: UserProfile; recoveryKey: string[] } | null>;
}

const authContext = createContext<Context | null>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context | null => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth(storeInstance: DominateStore) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const getIsOwner = (profile: UserProfile): boolean =>
    Boolean(profile?.id && profile.id === profile?.team?.owner_id);

  // Wrapper to the set hook to add the auth token
  const updateUser = (authedUser: User | null) => {
    if (authedUser?.authToken) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      axios.defaults.headers.common.Authorization = `Token ${authedUser.authToken}`;
    }

    setUser(authedUser);

    if (authedUser) {
      const IS_MONITORED = import.meta.env.VITE_IS_MONITORED === "true";

      if (IS_MONITORED && authedUser.username) {
        void import("@sentry/react").then((Sentry) => {
          Sentry.setUser({ email: authedUser.username || "" });
        });

        void import("logrocket").then((Logrocket: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, no-underscore-dangle
          Logrocket?._logger?.identify(authedUser.username);
        });
      }

      void getUserProfile().then(
        (profile) => {
          setUserProfile(profile);
          setReady(true);
          setIsOwner(getIsOwner(profile));
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
  ): Promise<{ profile: UserProfile; recoveryKey: string[] } | null> => {
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
  useMountEffect(() => {
    storeInstance
      .init()
      .then((authedUser) => {
        if (authedUser) {
          updateUser(authedUser);
        } else {
          updateUser(null);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  });

  // Return the user object and auth methods
  return {
    user,
    userProfile,
    ready,
    isOwner,
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
