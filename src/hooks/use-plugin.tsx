import { useState, useEffect, useContext, createContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Plugin } from "@/services/plugins/interfaces";
import { getPlugins } from "@/services/plugins";

interface Props {
  children: React.ReactElement;
}

interface Context {
  ready: boolean;
}

const pluginContext = createContext<Context | null>(null);

export const usePlugins = (): Context | null => useContext(pluginContext);

function useProviderPlugins() {
  const auth = useAuth();
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (auth && auth.ready && plugins && auth.userProfile) {
      // fetch list of registered plugins from STORE
      void getPlugins(auth.userProfile.team.id)
        .then(setPlugins)
        .catch((e) => console.error(e));
    }
  }, [auth, plugins]);

  useEffect(() => {
    if (!plugins) return;
    setReady(true);
  }, [plugins]);

  if (!auth) return null;

  return {
    ready,
  };
}

export function ProvidePlugins(props: Props): React.ReactElement {
  const plugins = useProviderPlugins();
  return (
    <pluginContext.Provider value={plugins}>
      {props.children}
    </pluginContext.Provider>
  );
}
