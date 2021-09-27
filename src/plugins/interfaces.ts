import { MetaItem } from "@/store/interfaces";

interface IPlugin {
  icon: string;
  name: string;
  tooltip: string;
  usesModal: boolean;
  onClick: (metadata?: MetaItem[] | null) => JSX.Element | null | void;
}

interface IPluginConstructor {
  new (): IPlugin;
}

interface IObjectKeys {
  [key: string]: IPluginConstructor;
}

export { IPlugin, IPluginConstructor, IObjectKeys };
