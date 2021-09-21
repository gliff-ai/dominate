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
  enabled?: boolean;
}
interface State {
  pluginInstances: IPlugin[];
  isModalVisible: boolean;
  modalContent: ReactElement | null;
  triggerClosing: number;
}

export class Plugins extends Component<Props, State> {
  static defaultProps = {
    plugins: null,
    metadata: null,
    enabled: true,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      pluginInstances: [],
      isModalVisible: false,
      modalContent: null,
      triggerClosing: 0,
    };
  }

  async componentDidMount(): Promise<void> {
    // Are there any plugins to load?
    const pluginList = this.props.plugins || [];
    const promisePlugins: Promise<IPluginConstructor | null>[] = [];
    for (const pluginName of pluginList) {
      promisePlugins.push(loadPlugin(pluginName));
    }

    const loadedPlugins: Array<IPluginConstructor | null> = [];
    await Promise.allSettled(promisePlugins).then((results) =>
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          loadedPlugins.push(result.value);
        }
      })
    );

    const initialisedToolPlugins: IPlugin[] = [];
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

  hideModal = (): void => this.setState({ isModalVisible: false });

  showModal = (): void => this.setState({ isModalVisible: true });

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
                  this.setState((prevState) => ({
                    modalContent: element,
                    triggerClosing: prevState.triggerClosing + 1,
                  }));
                }
              }}
            />
          ) : null
        )}
      </Card>
    );

    return (
      <>
        <BasePopover
          tooltip={{ name: "Plugins", icon: imgSrc("plugins") }}
          enabled={this.props.enabled}
          tooltipPlacement="top"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          triggerClosing={this.state.triggerClosing}
        >
          {buttons}
        </BasePopover>
        <PluginModal
          isVisible={this.state.isModalVisible}
          hide={this.hideModal}
        >
          {this.state.modalContent}
        </PluginModal>
      </>
    );
  }
}
