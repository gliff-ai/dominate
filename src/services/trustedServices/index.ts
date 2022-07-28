import { apiRequest } from "@/api";
import type {
  TrustedServiceIn,
  TrustedServiceOut,
  UiTemplate,
} from "./interfaces";

const getTrustedService = (): Promise<TrustedServiceIn[]> =>
  apiRequest<TrustedServiceIn[]>(`/trusted_service/`, "GET");

const createTrustedService = (
  trustedService: TrustedServiceOut
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "POST", { ...trustedService });

const updateTrustedService = (
  trustedService: TrustedServiceOut
): Promise<number> =>
  apiRequest<number>("/trusted_service/", "PUT", { ...trustedService });

const deleteTrustedService = (
  trustedService: TrustedServiceOut
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

export { trustedServicesAPI };
export type { TrustedServiceIn, TrustedServiceOut };
