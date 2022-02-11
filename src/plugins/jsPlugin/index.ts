import { IPluginConstructor, IObjectKeys, IPlugin } from "./interfaces";
import { SamplePlugin } from "./example/SamplePlugin";
import { Plugin, PluginType } from "@/plugins/interfaces";

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
  plugins: Plugin[]
): Promise<{ [name: string]: IPlugin[] }> {
  const loadedPlugins: {
    name: string;
    PluginConstructor: IPluginConstructor | null;
  }[] = [];

  await Promise.allSettled(
    plugins
      .filter(({ type }) => type === PluginType.Javascript)
      .map(async ({ name, url }) => {
        return { name, PluginConstructor: await loadJsPlugin(url) };
      })
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
        init["name"] = name;
        pluginTools[name] = [init];
      } catch (e) {
        console.error(`Error load plug-in: ${(e as Error).message}`);
      }
    }
  }
  return pluginTools;
}

export { initJsPluginObjects };
