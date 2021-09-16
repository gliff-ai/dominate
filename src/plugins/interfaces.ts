import { ReactElement } from "react";
import { MetaItem } from "@/store/interfaces";

interface IPlugin {
  icon: string;
  name: string;
  tooltip: string;
  usesModal: boolean;
  onClick: (metadata?: MetaItem[] | null) => ReactElement | null;
}

interface IPluginConstructor {
  new (): IPlugin;
}

interface IObjectKeys {
  [key: string]: IPluginConstructor;
}

export { IPlugin, IPluginConstructor, IObjectKeys };
