import { CollectionUidsExtra } from "@/plugins/interfaces";

interface JsPlugin {
  type: "Javascript" | "Python" | "AI";
  name: string;
  url: string;
  enabled: boolean;
  products: "CURATE" | "ANNOTATE" | "ALL";
}

interface JsPluginIn extends JsPlugin {
    collection_uids: CollectionUidsExtra[];
}

interface JsPluginOut extends JsPlugin {
    collection_uids: string[];
}

export type {JsPluginIn, JsPluginOut}
