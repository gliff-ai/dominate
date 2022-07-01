import { IPluginConstructor, IObjectKeys } from "./interfaces";
import { SamplePlugin } from "./example/SamplePlugin";
import { PluginOut, PluginType, PluginElement } from "@/plugins/interfaces";

const builtinPlugins: IObjectKeys = { SamplePlugin };

async function loadJsPlugin(
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

async function initJsPluginObjects(
  plugins: PluginOut[]
): Promise<{ [name: string]: PluginElement[] }> {
  const loadedPlugins: {
    name: string;
    PluginConstructor: IPluginConstructor | null;
  }[] = [];

  await Promise.allSettled(
    plugins
      .filter(({ type }) => type === PluginType.Javascript)
      .map(async ({ name, url }) => ({
        name,
        PluginConstructor: await loadJsPlugin(url),
      }))
  ).then((results) =>
    results.forEach((result) => {
      if (result?.status === "fulfilled" && result?.value) {
        loadedPlugins.push(result.value);
      }
    })
  );

  const pluginTools = {};
  for (const { name, PluginConstructor } of loadedPlugins) {
    if (PluginConstructor !== null) {
      try {
        const init = new PluginConstructor();
        init.name = name;
        init.type = "Javascript";
        pluginTools[name] = [init];
      } catch (e) {
        console.error(`Error load plug-in: ${(e as Error).message}`);
      }
    }
  }
  return pluginTools;
}

export { initJsPluginObjects };
