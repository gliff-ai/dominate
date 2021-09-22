import { apiRequest } from "@/api";

interface TrustedServiceInterface {
  trustedService: string; // name of trusted service
  placement: string[]; // where the ui element is placed
  baseUrl: string; // base url of api endpoint
  apiEndpoint: string;
  icon: string; // icon of ui element
  tooltip?: string; // tooltip of ui element
  value?: string; // value for ui element
  message?: string; // message returned in the response
  onClick: (collectionUid: string, imageUid: string) => Promise<ApiResponse>;
}

interface ApiResponse {
  message: string;
}

export class TrustedServiceClass implements TrustedServiceInterface {
  trustedService: string;

  placement: string[];

  baseUrl: string;

  apiEndpoint: string;

  icon: string;

  tooltip: string;

  value: string;

  constructor(
    trustedService: string,
    placement: string[],
    baseUrl: string,
    apiEndpoint: string,
    icon: string,
    tooltip: string,
    value?: string
  ) {
    this.trustedService = trustedService;
    this.placement = placement;
    this.baseUrl = baseUrl;
    this.apiEndpoint = apiEndpoint;
    this.icon = icon;
    this.tooltip = tooltip;
    this.value = value || "";
  }

  onClick = async (
    collectionUid: string,
    imageUid: string
  ): Promise<ApiResponse> => {
    return await apiRequest<ApiResponse>(
      this.apiEndpoint,
      "POST",
      { collectionUid, imageUid },
      this.baseUrl
    );
  };
}
