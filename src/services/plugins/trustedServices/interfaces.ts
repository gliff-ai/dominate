import { JsPlugin } from "../jsPlugins/interfaces";

export interface TrustedService extends JsPlugin {
  username: string;
}
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
