import { apiRequest } from "@/api";
import type { TrustedService, UiTemplate } from "./interfaces";

const getTrustedService = (): Promise<TrustedService[]> =>
  apiRequest<TrustedService[]>(`/trusted_service/`, "GET");

const createTrustedService = (
  trustedService: TrustedService
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "POST", { ...trustedService });

const updateTrustedService = (
  trustedService: Omit<TrustedService, "id">
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "PUT", { ...trustedService });

const deleteTrustedService = (
  trustedService: Omit<TrustedService, "id">
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "DELETE", { ...trustedService });

const getUiTemplate = (apiUrl: string): Promise<UiTemplate> =>
  apiRequest<UiTemplate>("/ui-template/", "POST", {}, apiUrl);

const trustedServicesAPI = {
  createTrustedService,
  getTrustedService,
  updateTrustedService,
  deleteTrustedService,
  getUiTemplate,
};

export { TrustedService };
export { TrustedServiceClass } from "./TrustedServiceClass";
export { trustedServicesAPI };
