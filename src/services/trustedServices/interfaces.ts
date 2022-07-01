import { JsPlugin } from "../plugins/interfaces";

export type CollectionUidsWithExtra = {
  uid: string;
  is_invite_pending: "True" | "False";
};

export interface TrustedServiceOut extends JsPlugin {
  username: string;
}
export interface TrustedServiceIn
  extends Omit<TrustedServiceOut, "collection_uids"> {
  collection_uids: CollectionUidsWithExtra[];
}

export interface UiTemplate {
  trustedService: string;
  uiElements: UiElement[];
}

export interface UiElement {
  placement: string[]; // TODO: delete
  apiEndpoint: string;
  uiParams: {
    tag?: string; // NOTE: unused
    value?: string; // NOTE: unused
    icon: string; // TODO: delete
    tooltip: string;
  };
}
