import { apiRequest } from "@/api";
import type { JsPlugin, JsPluginIn, JsPluginOut } from "./interfaces";

const getPlugins = (): Promise<JsPluginIn[]> =>
  apiRequest<JsPluginIn[]>(`/plugin/`, "GET");

const createPlugin = (plugin: JsPluginOut): Promise<number> =>
  apiRequest<number>("/plugin/", "POST", { ...plugin });

const updatePlugin = (plugin: JsPlugin): Promise<number> =>
  apiRequest<number>("/plugin/", "PUT", { ...plugin });

const deletePlugin = (plugin: JsPlugin): Promise<number> =>
  apiRequest<number>("/plugin/", "DELETE", { ...plugin });

const jsPluginsAPI = { getPlugins, createPlugin, updatePlugin, deletePlugin };

export { jsPluginsAPI };
export type { JsPlugin, JsPluginIn, JsPluginOut };
