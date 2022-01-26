export interface Plugin {
  name: string;
  url: string;
  enabled: boolean;
  products: Product;
}

export type Product = "CURATE" | "ANNOTATE" | "ALL";
