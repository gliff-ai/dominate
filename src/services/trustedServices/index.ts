import { apiRequest } from "@/api";
import type { TrustedService, UiTemplate } from "./interfaces";

export const getTrustedService = (teamId: number): Promise<TrustedService[]> =>
  apiRequest<TrustedService[]>(`/trusted_service/${teamId}`, "GET");

export const createTrustedService = (
  teamId: number,
  name: string,
  baseUrl: string
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "POST", {
    team_id: teamId,
    name,
    base_url: baseUrl,
  });

export const getUiTemplate = (apiUrl: string): Promise<UiTemplate> =>
  apiRequest<UiTemplate>("/ui-template", "POST", {}, apiUrl);

export { TrustedService };
export { TrustedServiceClass } from "./TrustedServiceClass";
