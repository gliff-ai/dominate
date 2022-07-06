interface JsPlugin {
  type: "Javascript" | "Python" | "AI";
  name: string;
  description: string;
  url: string;
  enabled: boolean;
  products: "CURATE" | "ANNOTATE" | "ALL";
  collection_uids: string[];
}

interface JsPluginIn extends JsPlugin {
  author: string;
}

interface JsPluginOut extends JsPlugin {
  origin_id: number | null;
}

export { JsPlugin, JsPluginIn, JsPluginOut };
