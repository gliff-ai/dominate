import { JsPluginIn, JsPluginOut } from "../plugins/interfaces";

interface TrustedService {
  username: string;
}
export interface TrustedServiceIn extends JsPluginIn, TrustedService {}
export interface TrustedServiceOut extends JsPluginOut, TrustedService {}

export interface UiTemplate {
  trustedService: string;
  uiElements: UiElement[];
}

export interface UiElement {
  placement: string[]; // TODO: delete
  apiEndpoint: string;
  uiParams: {
    tag?: string; // NOTE: unused
    value?: string; // NOTE: unused
    icon: string; // TODO: delete
    tooltip: string;
  };
}
