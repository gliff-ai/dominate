export interface TrustedService {
  team_id: number;
  name: string;
  base_url: string;
}

export interface UiElement {
  placement: string[];
  apiEndpoint: string;
  uiParams: {
    tag: string;
    value?: string;
    icon?: string;
    tooltip?: string;
  };
}

export interface UiTemplate {
  trustedService: string;
  uiElements: UiElement[];
}
