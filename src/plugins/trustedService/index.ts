import Ajv from "ajv";
import { Plugin, PluginType } from "@/plugins/interfaces";
import { TrustedServiceClass, ITrustedService } from "./TrustedServiceClass";
import { UiTemplateSchema } from "./schemas";
import { trustedServicesAPI } from "@/services/trustedServices";
import { UiTemplate } from "@/services/trustedServices/interfaces";

function unpackUiElements(
  { name, url: baseUrl }: Plugin,
  template: UiTemplate
): ITrustedService[] {
  return template.uiElements.map(
    ({ apiEndpoint, uiParams }) =>
      new TrustedServiceClass(name, baseUrl, apiEndpoint, uiParams.tooltip)
  );
}

async function initTrustedServiceObjects(
  plugins: Plugin[]
): Promise<{ [name: string]: ITrustedService[] }> {
  // prepare for validating JSON file
  const ajv = new Ajv();
  const validate = ajv.compile(UiTemplateSchema);

  const results = await Promise.allSettled(
    plugins
      .filter(({ type }) => type !== PluginType.Javascript)
      .map(async (plugin) => {
        if (!plugin.url || plugin.url === "") return null;

        // get UI template store as JSON file
        return {
          plugin,
          template: await trustedServicesAPI.getUiTemplate(plugin.url),
        };
      })
  );

  const trustedServices = {};
  results.forEach((result) => {
    if (result?.status === "fulfilled" && result?.value) {
      const { plugin, template } = result?.value;

      try {
        if (template && validate(template)) {
          trustedServices[plugin.name] = unpackUiElements(plugin, template);
        } else {
          console.error(
            `UI template for plug-in ${plugin.name} doesn't match the schema.`
          );
        }
      } catch {
        console.error(
          `Cannot fetch UI template for plug-in ${plugin.name}. 
          Make sure the plug-in is deployed correctly.`
        );
      }
    }
  });
  return trustedServices;
}

export { initTrustedServiceObjects };
