import { PluginElement } from "../interfaces";

interface IPluginConstructor {
  new (): PluginElement;
}

interface IObjectKeys {
  [key: string]: IPluginConstructor;
}

export { IPluginConstructor, IObjectKeys };
