import { Product, Plugin } from "@gliff-ai/manage";
import { jsPluginsAPI, trustedServicesAPI } from "@/services/plugins";
import { PluginObject } from "./interfaces";
import { initJsPluginObjects } from "./jsPlugin";

import { initTrustedServiceObjects } from "./trustedService";

async function getActivePlugins(
  currentProduct: Product,
  collectionUid: string
): Promise<Plugin[] | null> {
  // Get plugins data from STORE
  try {
    const newPlugins = (
      (await trustedServicesAPI.getTrustedService()) as Plugin[]
    ).concat((await jsPluginsAPI.getPlugins()) as Plugin[]);

    return newPlugins.filter(
      ({ collection_uids, products, enabled }) =>
        collection_uids.includes(collectionUid) &&
        (products === currentProduct || products === Product.ALL) &&
        enabled
    );
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function initPluginObjects(
  currentProduct: Product,
  collectionUid: string,
  user_username: string
): Promise<PluginObject | null> {
  // Initialise plugin objects

  try {
    const plugins = await getActivePlugins(currentProduct, collectionUid);

    if (plugins) {
      const jsPlugins = await initJsPluginObjects(plugins);
      const trustedServices = await initTrustedServiceObjects(
        plugins,
        user_username
      );

      return { ...jsPlugins, ...trustedServices };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export { initPluginObjects };
export type { PluginObject };
