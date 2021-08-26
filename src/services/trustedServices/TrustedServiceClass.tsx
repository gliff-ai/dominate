interface TrustedServiceInterface {
  trustedService: string; // name of trusted service
  placement: string[]; // where the ui element is placed
  apiUrl: string; // url of api endpoint
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

  apiUrl: string;

  icon: string;

  tooltip: string;

  value: string;

  message: string;

  constructor(
    trustedService: string,
    placement: string[],
    apiUrl: string,
    value?: string,
    icon?: string,
    tooltip?: string
  ) {
    this.trustedService = trustedService;
    this.placement = placement;
    this.apiUrl = apiUrl;
    this.value = value;
    this.icon = icon;
    this.tooltip = tooltip;
    this.message = null;
  }

  onClick = (collectionUid: string, imageUid: string): void => {
    fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionUid, imageUid }),
    })
      .then((response) => response.json())
      .then((data: ApiResponse) => console.log(data.message))
      .catch((e) => console.log(e));
  };
}
