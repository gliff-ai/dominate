import { apiRequest } from "@/api";
import type { TrustedService, UiTemplate } from "./interfaces";

export const getTrustedService = (): Promise<TrustedService[]> =>
  apiRequest<TrustedService[]>(`/trusted_service/`, "GET");

export const createTrustedService = (
  trustedService: TrustedService
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "POST", { ...trustedService });

export const getUiTemplate = (apiUrl: string): Promise<UiTemplate> =>
  apiRequest<UiTemplate>("/ui-template/", "POST", {}, apiUrl);

export { TrustedService };
export { TrustedServiceClass } from "./TrustedServiceClass";
