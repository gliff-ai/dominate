import { apiRequest } from "@/api";
import { PluginDataIn, PluginDataOut } from "../interfaces";

interface ITrustedService {
  name: string;
  baseUrl: string;
  apiEndpoint: string;
  tooltip: string;
  onClick: (data: PluginDataIn) => Promise<PluginDataOut>;
}

class TrustedServiceClass implements ITrustedService {
  name: string;
  baseUrl: string;
  apiEndpoint: string;
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

export { TrustedServiceClass, ITrustedService };
