import { apiRequest } from "@/api";
import type { JsPluginOut, JsPluginIn } from "./interfaces";

const getPlugins = (): Promise<JsPluginIn[]> =>
  apiRequest<JsPluginIn[]>(`/plugin/`, "GET");

const createPlugin = (plugin: JsPluginOut): Promise<number> =>
  apiRequest<number>("/plugin/", "POST", { ...plugin });

const updatePlugin = (plugin: JsPluginOut): Promise<number> =>
  apiRequest<number>("/plugin/", "PUT", { ...plugin });

const deletePlugin = (plugin: JsPluginOut): Promise<number> =>
  apiRequest<number>("/plugin/", "DELETE", { ...plugin });

const jsPluginsAPI = { getPlugins, createPlugin, updatePlugin, deletePlugin };

export { jsPluginsAPI };
export type { JsPluginOut, JsPluginIn };
