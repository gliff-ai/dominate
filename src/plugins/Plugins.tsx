import { Component, ReactElement } from "react";
import { Card } from "@material-ui/core";
import { BaseIconButton, BasePopover } from "@gliff-ai/style";
import { IPlugin, IPluginConstructor } from "./interfaces";
import { MetaItem } from "@/store/interfaces";
import { loadPlugin } from "./index";
import { PluginModal } from "./PluginModal";
import { imgSrc } from "@/imgSrc";

interface Props {
  plugins?: string[] | null;
  metadata?: MetaItem[] | null;
}
interface State {
  pluginInstances: IPlugin[];
  isModalVisible: boolean;
  modalContainer: ReactElement | null;
}
export class Plugins extends Component<Props, State> {
  static defaultProps = {
    plugins: null,
    metadata: null,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      pluginInstances: [],
      isModalVisible: false,
      modalContainer: null,
    };
  }

  async componentDidMount(): Promise<void> {
    // Are there any plugins to load?
    const pluginList = this.props.plugins || [];
    const promisePlugins: Promise<IPluginConstructor | null>[] = [];
    const initialisedToolPlugins: IPlugin[] = [];

    for (const pluginName of pluginList) {
      promisePlugins.push(loadPlugin(pluginName));
    }

    let loadedPlugins: Array<IPluginConstructor | null> = [];
    await Promise.all(promisePlugins)
      .then((data) => {
        loadedPlugins = data;
      })
      .catch((e) => console.error(e));

    for (const PluginConstructor of loadedPlugins) {
      if (PluginConstructor !== null) {
        try {
          const init = new PluginConstructor();
          initialisedToolPlugins.push(init);
        } catch (e) {
          console.error(`Error Loading Plugin: ${(e as Error).message}`);
        }
      }
    }
    this.setState({ pluginInstances: initialisedToolPlugins });
  }

  hideModal = () => this.setState({ isModalVisible: false });

  showModal = () => this.setState({ isModalVisible: true });

  render(): ReactElement | null {
    const buttons = (
      <Card>
        {this.state.pluginInstances.map((plugin) =>
          plugin ? (
            <BaseIconButton
              key={`plugin-${plugin.name}`}
              tooltip={{ name: plugin.tooltip, icon: imgSrc(plugin.icon) }}
              fill={undefined}
              tooltipPlacement="top-start"
              onClick={() => {
                if (plugin.usesModal) this.showModal();
                const element = plugin.onClick(this.props?.metadata);
                if (element) {
                  this.setState({ modalContainer: element });
                }
              }}
            />
          ) : null
        )}
      </Card>
    );

    return (
      <>
        <PluginModal
          isVisible={this.state.isModalVisible}
          hide={this.hideModal}
        >
          {this.state.modalContainer}
        </PluginModal>
        <BasePopover
          tooltip={{ name: "Plugins", icon: imgSrc("plugins") }}
          tooltipPlacement="top-start"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          {buttons}
        </BasePopover>
      </>
    );
  }
}
