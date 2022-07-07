import { JsPlugin, JsPluginOut, jsPluginsAPI } from "./jsPlugins";
import { TrustedService, trustedServicesAPI } from "./trustedServices";
import { Plugin, PluginType } from "@/plugins";
import { DominateStore } from "@/store";

const getPlugins = async (): Promise<Plugin[]> => {
  // DOTO: rewrite so as to make a single request.
  let allPlugins: Plugin[] = [];

  try {
    const trustedServices =
      (await trustedServicesAPI.getTrustedService()) as Plugin[];
    allPlugins = allPlugins.concat(trustedServices);
  } catch (e) {
    console.error(e);
  }

  try {
    const jsplugins = (await jsPluginsAPI.getPlugins()) as Plugin[];
    allPlugins = allPlugins.concat(jsplugins);
  } catch (e) {
    console.error(e);
  }
  console.log(allPlugins);

  return allPlugins;
};

const createPlugin =
  (storeInstance: DominateStore) =>
  async (plugin: Plugin): Promise<{ key: string; email: string } | null> => {
    plugin.origin_id = null; // FIXME: when plugins can be shared.

    if (plugin.type === PluginType.Javascript) {
      await jsPluginsAPI.createPlugin(plugin as JsPluginOut);
      return null;
    }

    const { key, email } = await storeInstance.createTrustedServiceUser();

    const res = await trustedServicesAPI.createTrustedService({
      username: email,
      ...plugin,
    } as TrustedService);

    return { key, email };
  };

const updatePlugin = async (plugin: Plugin): Promise<number> => {
  if (plugin.type === PluginType.Javascript) {
    return jsPluginsAPI.updatePlugin(plugin as JsPlugin);
  }
  return trustedServicesAPI.updateTrustedService(plugin as TrustedService);
};

const deletePlugin = async (plugin: Plugin): Promise<number> => {
  if (plugin.type === PluginType.Javascript) {
    return jsPluginsAPI.deletePlugin(plugin as JsPlugin);
  }
  return trustedServicesAPI.deleteTrustedService(plugin as TrustedService);
};

export { getPlugins, createPlugin, updatePlugin, deletePlugin };
export { jsPluginsAPI, trustedServicesAPI };
