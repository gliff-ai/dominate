export interface TrustedService {
  id: string;
  type: ServiceType;
  name: string;
  url: string;
  enabled: boolean;
  products: Product;
}

export type ServiceType = "Python" | "AI";

export type Product = "CURATE" | "ANNOTATE" | "ALL";

export interface UiElement {
  placement: string[];
  apiEndpoint: string;
  uiParams: {
    tag?: string;
    value?: string;
    icon: string;
    tooltip: string;
  };
}

export interface UiTemplate {
  trustedService: string;
  uiElements: UiElement[];
}
