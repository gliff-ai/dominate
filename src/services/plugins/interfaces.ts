export interface JsPlugin {
  type: "Javascript" | "Python" | "AI";
  name: string;
  url: string;
  enabled: boolean;
  products: "CURATE" | "ANNOTATE" | "ALL";
  collection_uids: string[];
}
