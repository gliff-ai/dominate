import { apiRequest } from "@/api";
import type { Plugin } from "./interfaces";

export const getPlugins = (): Promise<Plugin[]> =>
  apiRequest<Plugin[]>(`/plugin/`, "GET");

export const createPlugin = (plugin: Plugin): Promise<number> =>
  apiRequest<number>("/plugin/", "POST", { ...plugin });
