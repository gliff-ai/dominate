import { apiRequest } from "@/api";
import type { Plugin, Product } from "./interfaces";

export const getPlugins = (): Promise<Plugin[]> =>
  apiRequest<Plugin[]>(`/plugin/`, "GET");

export const createPlugin = (url: string, product: Product): Promise<number> =>
  apiRequest<number>("/plugin/", "POST", {
    url,
    product,
  });
