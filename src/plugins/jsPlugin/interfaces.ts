import { PluginDataIn, PluginDataOut } from "../interfaces";

interface IPlugin {
  name?: string;
  tooltip: string;
  onClick: (data: PluginDataIn) => Promise<PluginDataOut>;
}

interface IPluginConstructor {
  new (): IPlugin;
}

interface IObjectKeys {
  [key: string]: IPluginConstructor;
}

export { IPlugin, IPluginConstructor, IObjectKeys };
