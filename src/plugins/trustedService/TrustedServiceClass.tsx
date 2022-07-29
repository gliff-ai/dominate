import { apiRequest } from "@/api";
import { PluginElement, PluginDataIn, PluginDataOut } from "../interfaces";

class TrustedServiceClass implements PluginElement {
  type: string;

  name: string;

  private baseUrl: string;

  private username: { plugin: string; user: string };

  private encryptedAccessKey: string;

  tooltip: string;

  constructor(
    type: string,
    name: string,
    baseUrl: string,
    tooltip: string,
    username: { plugin: string; user: string },
    encryptedAccessKey: string
  ) {
    this.type = type;
    this.name = name;
    this.baseUrl = baseUrl;
    this.tooltip = tooltip;
    this.username = username;
    this.encryptedAccessKey = encryptedAccessKey;
  }

  onClick = async (data: PluginDataIn): Promise<PluginDataOut> => {
    const requestBody = {
      ...data,
      username: this.username,
      encrypted_access_key: this.encryptedAccessKey,
    };
    const response = await apiRequest<PluginDataOut>(
      "/run/", // trusted-service API endpoint
      "POST",
      requestBody,
      this.baseUrl
    );
    return response;
  };
}

export { TrustedServiceClass };
