import { useEffect, useState } from "react";
import { Product } from "@gliff-ai/manage";
import { initPluginObjects, PluginObject } from "@/plugins";
import { AuthContext } from "./use-auth";

export function usePlugins(
  collectionUid: string,
  auth: AuthContext | null,
  product: Product,
  rerender?: number
): PluginObject | null {
  const [plugins, setPlugins] = useState<PluginObject | null>(null);

  useEffect(() => {
    if (!auth?.user?.username || !collectionUid) return;

    void initPluginObjects(product, collectionUid, auth.user.username).then(
      setPlugins
    );
  }, [auth?.user?.username, collectionUid, product, rerender]);

  return plugins;
}
