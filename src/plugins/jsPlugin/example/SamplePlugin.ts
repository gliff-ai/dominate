import { IPlugin } from "../interfaces";

export class SamplePlugin implements IPlugin {
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
