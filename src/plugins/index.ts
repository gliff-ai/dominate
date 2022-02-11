import { jsPluginsAPI } from "@/services/plugins";
import { trustedServicesAPI } from "@/services/trustedServices";
import { Plugin, Product, PluginType, PluginObject } from "./interfaces";

import { initJsPluginObjects } from "./jsPlugin";

import { initTrustedServiceObjects } from "./trustedService";

async function getPlugins(currentProduct: Product, collectionUid: string) {
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
  collectionUid: string
): Promise<PluginObject | null> {
  // Initialise plugin objects

  try {
    const plugins = await getPlugins(currentProduct, collectionUid);

    if (plugins) {
      const jsPlugins = await initJsPluginObjects(plugins);
      const trustedServices = await initTrustedServiceObjects(plugins);

      return { ...jsPlugins, ...trustedServices };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export { getPlugins, initPluginObjects, Product, PluginType };
export type { Plugin, PluginObject };
