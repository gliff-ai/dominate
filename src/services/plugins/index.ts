import { Plugin, PluginType, PluginWithExtra } from "@gliff-ai/manage";
import { pluginsAPI } from "./api";
import { DominateStore } from "@/store";

const getPlugins = async (): Promise<PluginWithExtra[]> => {
  let plugins: PluginWithExtra[] = [];

  try {
    plugins = await pluginsAPI.getPlugins();
  } catch (e) {
    console.error(e);
  }
  return plugins;
};

const getZooPlugins = async (): Promise<Plugin[]> => {
  let plugins: Plugin[] = [];

  try {
    plugins = await pluginsAPI.getZooPlugins();
  } catch (e) {
    console.error(e);
  }
  return plugins;
};

const createPlugin =
  (storeInstance: DominateStore) =>
  async (plugin: Plugin): Promise<{ key?: string; email: string } | null> => {
    if (plugin.type === PluginType.Javascript) {
      await pluginsAPI.createPlugin(plugin);
      return null;
    }

    // if the plugin has an origin and is therefore copied over from another team, use the origin's public-key
    const originPublicKey =
      plugin.origin_id !== null ? plugin.public_key : undefined;

    const { publicKey, encryptedAccessKey, privateKey, email } =
      await storeInstance.createTrustedServiceUser(originPublicKey);

    const res = await pluginsAPI.createPlugin({
      ...plugin,
      username: email,
      public_key: publicKey,
      encrypted_access_key: encryptedAccessKey,
    });

    return { key: privateKey, email };
  };

const updatePlugin = async (plugin: Plugin): Promise<number> => {
  const pluginId = await pluginsAPI.updatePlugin(plugin);
  return pluginId;
};

const deletePlugin = async ({ url }: Plugin): Promise<number> => {
  const pluginId = await pluginsAPI.deletePlugin(url);
  return pluginId;
};

export { getPlugins, getZooPlugins, createPlugin, updatePlugin, deletePlugin };
export { pluginsAPI };
