import { JsPlugin, JsPluginIn, JsPluginOut } from "../jsPlugins/interfaces";

interface TrustedService extends JsPlugin {
  username: string;
  public_key: string;
  encrypted_access_key: string;
}

interface TrustedServiceIn extends TrustedService, JsPluginIn {}
interface TrustedServiceOut extends TrustedService, JsPluginOut {}
interface UiTemplate {
  ui: {
    button: { name?: string; tooltip: string };
  };
}

export { TrustedService, TrustedServiceIn, TrustedServiceOut, UiTemplate };
