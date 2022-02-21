import { apiRequest } from "@/api";
import { PluginElement, PluginDataIn, PluginDataOut } from "../interfaces";

class TrustedServiceClass implements PluginElement {
  name: string;

  private baseUrl: string;

  private apiEndpoint: string;

  tooltip: string;

  constructor(
    name: string,
    baseUrl: string,
    apiEndpoint: string,
    tooltip: string
  ) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.apiEndpoint = apiEndpoint;
    this.tooltip = tooltip;
  }

  onClick = async (data: PluginDataIn): Promise<PluginDataOut> => {
    const response = await apiRequest<PluginDataOut>(
      this.apiEndpoint,
      "POST",
      { ...data },
      this.baseUrl
    );
    return response;
  };
}

export { TrustedServiceClass };
