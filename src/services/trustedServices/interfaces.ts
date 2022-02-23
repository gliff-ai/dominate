import { JsPlugin } from "../plugins/interfaces";

export interface TrustedService extends JsPlugin {
  username: string;
}

export interface UiElement {
  placement: string[];
  apiEndpoint: string;
  uiParams: {
    tag?: string;
    value?: string;
    icon: string;
    tooltip: string;
  };
}
export interface UiTemplate {
  trustedService: string;
  uiElements: UiElement[];
}
