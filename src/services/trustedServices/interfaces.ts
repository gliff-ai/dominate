export interface TrustedService {
  id: string;
  type: "Python" | "AI";
  name: string;
  url: string;
  enabled: boolean;
  products: "CURATE" | "ANNOTATE" | "ALL";
}
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
