import { MetaItem } from "@/interfaces";

interface PluginElement {
  type?: string; // added by DOMINATE, not by the plugin's creator
  name: string;
  tooltip: string;
  onClick: (data: PluginDataIn) => Promise<PluginDataOut>;
}

type PluginObject = { [name: string]: PluginElement[] };

interface PluginDataIn {
  usernames?: { plugin: string; user: string };
  collectionUid?: string;
  imageUid?: string;
  metadata?: MetaItem[] | null;
}

interface PluginDataOut {
  status?: string; // processing outcome
  message?: string; // any message returned by the plugin
  domElement?: JSX.Element | null;
}

export type { PluginObject, PluginDataIn, PluginDataOut, PluginElement };
