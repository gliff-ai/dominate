import { JsPlugin } from "../plugins/interfaces";

export interface TrustedService extends JsPlugin {
  username: string;
}
export interface UiTemplate {
  ui: {
    button: { name?: string; tooltip: string };
  };
}
