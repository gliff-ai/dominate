import { PluginElement } from "@/plugins/interfaces";

export class SamplePlugin implements PluginElement {
  name: string;

  tooltip: string;

  constructor() {
    this.name = "SamplePlugin";
    this.tooltip = "A sample tool plugin";
  }

  onClick = (): any => {
    alert("Hello! This is a sample plugin.");
  };
}
