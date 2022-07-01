import { MetaItem } from "@/interfaces";

// NOTE: Product, PluginType and Plugin are also defined in MANAGE

enum Product {
  "CURATE" = "CURATE",
  "ANNOTATE" = "ANNOTATE",
  "ALL" = "ALL",
}

enum PluginType {
  "Javascript" = "Javascript",
  "Python" = "Python",
  "AI" = "AI",
}

interface Plugin {
  username?: string; // trusted-service username (i.e., email address)
  name: string; // plugin name
  type: PluginType;
  url: string; // base_url for trusted-services and url for plugins
  products: Product;
  enabled: boolean;
}

type CollectionUidsExtra = { uid: string; is_invite_pending: "True" | "False" };

interface PluginIn extends Plugin {
  collection_uids: CollectionUidsExtra[]; // collection uids for the projects the plugin has been added to
}

interface PluginOut extends Plugin {
  collection_uids: string[];
}

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

export { Product, PluginType };
export type {
  CollectionUidsExtra,
  PluginOut,
  PluginIn,
  PluginObject,
  PluginDataIn,
  PluginDataOut,
  PluginElement,
};
