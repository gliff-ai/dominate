import axios from "axios";
import { useState, useContext, createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIntercom } from "react-use-intercom";
import type LogRocket from "logrocket";

import { DominateStore } from "@/store";
import { User, UserProfile } from "@/services/user/interfaces";
import { createUserProfile, getUserProfile, UserAccess } from "@/services/user";
import { useMountEffect } from "./use-mountEffect";

interface Props {
  children: React.ReactElement;
  storeInstance: DominateStore;
  logrocket: typeof LogRocket;
}

interface Context {
  user: User | null | undefined;
  userProfile: UserProfile | null;
  userProfileReady: boolean; // Not sure if this could be replaced by just inspecting the user profile?
  loaded: boolean;
  userAccess: UserAccess | null;
  getInstance: () => DominateStore;
  changePassword: (newPassword: string) => Promise<{ recoveryKey: string[] }>;
  signin: (username: string, password: string) => Promise<User>;
  signout: () => Promise<boolean>;
  signup: (username: string, password: string) => Promise<User>;
  createProfile: (
    name: string,
    teamId: number | undefined,
    inviteId: string | undefined,
    acceptedTermsAndConditions: boolean,
    tierId: number | undefined
  ) => Promise<{ profile: UserProfile; recoveryKey: string[] } | null>;
}

const authContext = createContext<Context | null>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context | null => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth(
  storeInstance: DominateStore,
  logrocket: typeof LogRocket
) {
  const { update } = useIntercom();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProfileReady, setUserProfileReady] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);

  const navigate = useNavigate();

  useEffect(() => setUserProfileReady(!!userProfile), [userProfile]);
  useEffect(
    () =>
      setLoaded(
        user !== undefined
      ) /* it's null if we don't have one, or a User obj */,
    [user]
  );

  const getUserAccess = (profile: UserProfile): UserAccess | null => {
    if (!profile?.id) return null;

    if (profile.id === profile?.team?.owner_id) {
      return UserAccess.Owner;
    }

    if (!profile?.is_collaborator) {
      return UserAccess.Member;
    }

    return UserAccess.Collaborator;
  };

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

        logrocket.identify(authedUser.username);
      }

      void getUserProfile().then(
        (profile) => {
          setUserProfile(profile);
          setUserAccess(getUserAccess(profile));

          update({
            name: profile.name,
            userId: profile.id.toString(),
            customAttributes: {
              user_level: getUserAccess(profile),
            },
          });
        },

        () => {
          // 401 / 403 error, so clear saved session:
          localStorage.removeItem("etebaseInstance");
          setUserProfileReady(true);
          navigate("signin");
        }
      );
    } else {
      setUserProfile(null);
      localStorage.removeItem("etebaseInstance");
    }
  };

  const getInstance = (): DominateStore => storeInstance;

  const signin = (username: string, password: string): Promise<User> =>
    storeInstance
      .login(username.trim().toLowerCase(), password)
      .then((storeUser) => {
        updateUser(storeUser);
        return storeUser;
      });

  const signup = (email: string, password: string): Promise<User> =>
    storeInstance
      .signup(email.trim().toLowerCase(), password)
      .then((storeUser) => {
        updateUser(storeUser);
        return storeUser;
      });

  const signout = (): Promise<boolean> =>
    storeInstance.logout().then((response) => {
      updateUser(null);
      return response;
    });

  const changePassword = async (
    newPassword: string
  ): Promise<{ recoveryKey: string[] }> =>
    storeInstance.changePassword(newPassword);

  const createProfile = async (
    name: string,
    teamId: number,
    inviteId: string,
    acceptedTermsAndConditions: boolean,
    tierId?: number
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
      savedSession,
      tierId
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
    userProfileReady,
    userAccess,
    loaded,
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
  const auth = useProvideAuth(props.storeInstance, props.logrocket);
  return (
    <authContext.Provider value={auth}>{props.children}</authContext.Provider>
  );
}
export { Context as AuthContext };
