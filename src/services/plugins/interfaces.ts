export interface Plugin {
  url: string;
  product: Product;
}

export type Product = "CURATE" | "ANNOTATE";
