import { apiRequest } from "@/api";
import { PluginElement, PluginDataIn, PluginDataOut } from "../interfaces";

class TrustedServiceClass implements PluginElement {
  type: string;

  name: string;

  private baseUrl: string;

  private apiEndpoint: string;

  private username: { plugin: string; user: string };

  private publicKey: string;

  private encryptedAccessKey: string;

  tooltip: string;

  constructor(
    type: string,
    name: string,
    baseUrl: string,
    apiEndpoint: string,
    tooltip: string,
    username: { plugin: string; user: string },
    publicKey: string,
    encryptedAccessKey: string
  ) {
    this.type = type;
    this.name = name;
    this.baseUrl = baseUrl;
    this.apiEndpoint = apiEndpoint;
    this.tooltip = tooltip;
    this.username = username;
    this.publicKey = publicKey;
    this.encryptedAccessKey = encryptedAccessKey;
  }

  onClick = async (data: PluginDataIn): Promise<PluginDataOut> => {
    const requestBody = {
      ...data,
      username: this.username,
      public_key: this.publicKey,
      encrypted_access_key: this.encryptedAccessKey,
    };
    const response = await apiRequest<PluginDataOut>(
      this.apiEndpoint,
      "POST",
      requestBody,
      this.baseUrl
    );
    return response;
  };
}

export { TrustedServiceClass };
