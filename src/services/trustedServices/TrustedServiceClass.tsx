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
  onClick: (collectionUid: string, imageUid: string) => void;
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

  message: string;

  constructor(
    trustedService: string,
    placement: string[],
    baseUrl: string,
    apiEndpoint: string,
    value?: string,
    icon?: string,
    tooltip?: string
  ) {
    this.trustedService = trustedService;
    this.placement = placement;
    this.baseUrl = baseUrl;
    this.apiEndpoint = apiEndpoint;
    this.value = value;
    this.icon = icon;
    this.tooltip = tooltip;
    this.message = null;
  }

  onClick = (collectionUid: string, imageUid: string): void => {
    void apiRequest<ApiResponse>(
      this.apiEndpoint,
      "POST",
      { collectionUid, imageUid },
      null,
      this.baseUrl
    ).then(({ message }) => console.log(message));
  };
}
