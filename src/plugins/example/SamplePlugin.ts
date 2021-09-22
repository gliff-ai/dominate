import { IPlugin } from "../interfaces";

export class SamplePlugin implements IPlugin {
  icon: string;

  name: string;

  tooltip: string;

  usesModal: boolean;

  constructor() {
    this.icon = "add";
    this.name = "SamplePlugin";
    this.tooltip = "A sample tool plugin";
    this.usesModal = false;
  }

  onClick = (): void => {
    alert("Hello! This is a sample plugin.");
  };
}
