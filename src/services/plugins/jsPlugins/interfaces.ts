export interface JsPlugin {
  type: "Javascript" | "Python" | "AI";
  author?: string;
  name: string;
  description: string;
  url: string;
  enabled: boolean;
  products: "CURATE" | "ANNOTATE" | "ALL";
  collection_uids: string[];
}
