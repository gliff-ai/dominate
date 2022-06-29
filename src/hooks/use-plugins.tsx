import { useEffect, useState } from "react";
import { initPluginObjects, PluginObject, Product } from "@/plugins";
import { AuthContext } from "./use-auth";

export function usePlugins(
  collectionUid: string,
  auth: AuthContext | null,
  product: Product
): PluginObject | null {
  const [plugins, setPlugins] = useState<PluginObject | null>(null);

  useEffect(() => {
    if (!auth?.user?.username || !collectionUid) return;

    void initPluginObjects(product, collectionUid, auth.user.username).then(
      setPlugins
    );
  }, [auth?.user?.username, collectionUid, product]);

  return plugins;
}
