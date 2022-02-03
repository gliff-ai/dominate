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
  username?: string;
  type: PluginType;
  name: string;
  url: string;
  products: Product;
  enabled: boolean;
  collection_uids: string[];
}

export { Product, PluginType };
export type { Plugin };
