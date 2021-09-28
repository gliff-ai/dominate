import { apiRequest } from "@/api";
import type { TrustedService, UiTemplate } from "./interfaces";

export const getTrustedService = (): Promise<TrustedService[]> =>
  apiRequest<TrustedService[]>(`/trusted_service/`, "GET");

export const createTrustedService = (
  id: string,
  name: string,
  base_url: string
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "POST", {
    id,
    name,
    base_url,
  });

export const getUiTemplate = (apiUrl: string): Promise<UiTemplate> =>
  apiRequest<UiTemplate>("/ui-template", "POST", {}, apiUrl);

export { TrustedService };
export { TrustedServiceClass } from "./TrustedServiceClass";
