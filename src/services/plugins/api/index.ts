import type { Plugin, PluginWithExtra } from "@gliff-ai/manage";
import { apiRequest } from "@/api";

const getPlugins = (): Promise<PluginWithExtra[]> =>
  apiRequest<PluginWithExtra[]>(`/plugin/`, "GET");

const getZooPlugins = (): Promise<Plugin[]> =>
  apiRequest<Plugin[]>(`/plugin/zoo/`, "GET");

const createPlugin = (plugin: Omit<Plugin, "author">): Promise<number> =>
  apiRequest<number>("/plugin/", "POST", { ...plugin });

const updatePlugin = (plugin: Omit<Plugin, "author">): Promise<number> =>
  apiRequest<number>("/plugin/", "PUT", { ...plugin });

const deletePlugin = (url: string): Promise<number> =>
  apiRequest<number>("/plugin/", "DELETE", { url });

export const pluginsAPI = {
  getPlugins,
  createPlugin,
  updatePlugin,
  deletePlugin,
  getZooPlugins,
};
