import { JsPlugin, JsPluginIn, JsPluginOut } from "../jsPlugins/interfaces";

interface TrustedService extends JsPlugin {
  username: string;
  // publicKey: string;
}

interface TrustedServiceIn extends TrustedService, JsPluginIn {}
interface TrustedServiceOut extends TrustedService, JsPluginOut {}

interface UiTemplate {
  trustedService: string;
  uiElements: UiElement[];
}

interface UiElement {
  placement: string[]; // TODO: delete
  apiEndpoint: string;
  uiParams: {
    tag?: string; // NOTE: unused
    value?: string; // NOTE: unused
    icon: string; // TODO: delete
    tooltip: string;
  };
}

export {
  TrustedService,
  TrustedServiceIn,
  TrustedServiceOut,
  UiTemplate,
  UiElement,
};
