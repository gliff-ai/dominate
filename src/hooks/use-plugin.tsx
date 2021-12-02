import { useState, useEffect, useContext, createContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Plugin } from "@/services/plugins/interfaces";
import { getPlugins } from "@/services/plugins";

interface Props {
  children: React.ReactElement;
}

interface Context {
  ready: boolean;
  plugins: Plugin[] | null;
}

const pluginContext = createContext<Context | null>(null);

export const usePlugins = (): Context | null => useContext(pluginContext);

function useProviderPlugins() {
  const auth = useAuth();
  const [ready, setReady] = useState<boolean>(false);
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);

  useEffect(() => {
    if (!auth?.ready || !auth?.user || plugins) return;
    // fetch list of registered plugins from STORE
    void getPlugins()
      .then(setPlugins)
      .catch((e) => console.error(e));
  }, [auth, plugins]);

  useEffect(() => {
    if (!plugins) return;
    setReady(true);
  }, [plugins]);

  if (!auth) return null;

  return {
    ready,
    plugins,
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
