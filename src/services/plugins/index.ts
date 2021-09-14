import { apiRequest } from "@/api";
import type { Plugin, Product } from "./interfaces";

export const getPlugins = (teamId: number): Promise<Plugin[]> =>
  apiRequest<Plugin[]>(`/plugin/${teamId}`, "GET");

export const createPlugin = (
  teamId: number,
  url: string,
  product: Product
): Promise<number> =>
  apiRequest<number>("/plugin/", "POST", {
    team_id: teamId,
    url,
    product,
  });