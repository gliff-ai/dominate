import { useEffect, useState } from "react";
import { Plugin } from "@gliff-ai/manage";
import { getPlugins } from "@/services/plugins";

export function useZooPlugins(rerender?: number): Plugin[] | null {
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);

  useEffect(() => {
    // get plugins data for the zoo dialog (should run once at mount or whenever 'rerender' changes)
    void getPlugins().then((newPlugins) => {
      setPlugins(newPlugins.filter((p) => p.is_public));
    });
  }, [rerender]);

  return plugins;
}
