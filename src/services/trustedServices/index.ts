import { apiRequest } from "@/api";
import {
  TrustedService,
  UiTemplate,
} from "@/services/trustedServices/interfaces";

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
  // TODO: validate ui template against a schema.
  apiRequest<UiTemplate>("/ui-template", "POST", null, null, apiUrl);

export { TrustedService };
export { TrustedServiceClass } from "./TrustedServiceClass";
