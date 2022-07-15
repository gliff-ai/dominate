import Ajv from "ajv";
import { Plugin, PluginType } from "@gliff-ai/manage";
import { apiRequest } from "@/api";
import { PluginElement } from "@/plugins/interfaces";
import { TrustedServiceClass } from "./TrustedServiceClass";
import { UiTemplateSchema } from "./schemas";
import { UiTemplate } from "./interfaces";

const getUiTemplate = (apiUrl: string): Promise<UiTemplate> =>
  apiRequest<UiTemplate>("/ui-template/", "POST", {}, apiUrl);

function unpackUiElements(
  { type, name, url, username, public_key, encrypted_access_key }: Plugin,
  template: UiTemplate,
  user_username: string
): PluginElement[] {
  // NOTE: having an array will make sense again once we introduce the toolbar.
  return [
    new TrustedServiceClass(
      type,
      name,
      url,
      template.ui.button.tooltip,
      {
        plugin: username as string,
        user: user_username,
      },
      public_key as string,
      encrypted_access_key as string
    ),
  ];
}

async function initTrustedServiceObjects(
  plugins: Plugin[],
  user_username: string
): Promise<{ [name: string]: PluginElement[] }> {
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
          template: await getUiTemplate(plugin.url),
        };
      })
  );

  const trustedServices = {};
  results.forEach((result) => {
    if (result?.status === "fulfilled" && result?.value) {
      const { plugin, template } = result?.value;

      try {
        if (template && validate(template)) {
          trustedServices[plugin.name] = unpackUiElements(
            plugin,
            template,
            user_username
          );
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
