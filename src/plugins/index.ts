import { IPluginConstructor, IObjectKeys } from "./interfaces";
import { SamplePlugin } from "./example/SamplePlugin";

const builtinPlugins: IObjectKeys = { SamplePlugin };

export async function loadPlugin(
  pluginName: string
): Promise<IPluginConstructor | null> {
  try {
    // Try to find it locally
    if (builtinPlugins[pluginName]) {
      return builtinPlugins[pluginName];
    }

    // Try to load the plugin
    const module = (await import(
      /* @vite-ignore */
      `${pluginName}`
    )) as {
      default: IPluginConstructor;
    };
    return module.default;
  } catch (e) {
    console.error(e);
  }
  return null;
}
