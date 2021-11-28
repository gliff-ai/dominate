import { Component, ReactElement } from "react";
import { WithStyles, withStyles } from "@material-ui/core";
import {
  BaseIconButton,
  BasePopover,
  theme,
  MessageSnackbar,
} from "@gliff-ai/style";
import { IPlugin, IPluginConstructor } from "./interfaces";
import { MetaItem } from "@/store/interfaces";
import { loadPlugin } from "./index";
import { PluginModal } from "./PluginModal";
import { imgSrc } from "@/imgSrc";

const styles = {
  card: { padding: "0 5px", backgroundColor: theme.palette.primary.light },
};
interface Props extends WithStyles<typeof styles> {
  plugins?: string[] | null;
  metadata?: MetaItem[] | null;
  enabled?: boolean;
}
interface State {
  pluginInstances: IPlugin[];
  isModalVisible: boolean;
  modalContent: ReactElement | null;
  triggerClosing: number;
  snackbarOpen: boolean;
}
class Plugins extends Component<Props, State> {
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
      snackbarOpen: false,
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

  render(): ReactElement | null {
    const { classes } = this.props;

    const buttons = (
      <div className={classes.card}>
        {this.state.pluginInstances.map((plugin) =>
          plugin ? (
            <BaseIconButton
              key={`plugin-${plugin.name}`}
              tooltip={{ name: plugin.tooltip, icon: imgSrc(plugin.icon) }}
              fill={undefined}
              tooltipPlacement="top"
              onClick={() => {
                const element = plugin.onClick(this.props?.metadata);

                // if plugin uses modal
                if (plugin.usesModal) {
                  if (element)
                    // if element is set, display this inside modal
                    this.setState((prevState) => ({
                      isModalVisible: true,
                      modalContent: element,
                      triggerClosing: prevState.triggerClosing + 1,
                    }));
                  // otherwise, display error message
                  else this.setState({ snackbarOpen: true });
                }
              }}
            />
          ) : null
        )}
      </div>
    );

    return (
      <>
        <BasePopover
          tooltip={{ name: "Plugins", icon: imgSrc("plugins") }}
          enabled={this.props.enabled}
          tooltipPlacement="top"
          anchorOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          triggerClosing={this.state.triggerClosing}
        >
          {buttons}
        </BasePopover>
        <PluginModal
          isVisible={this.state.isModalVisible}
          hide={() => this.setState({ isModalVisible: false })}
        >
          {this.state.modalContent}
        </PluginModal>
        <MessageSnackbar
          open={this.state.snackbarOpen}
          handleClose={() => this.setState({ snackbarOpen: false })}
          messageText="Oops, something went wrong."
        />
      </>
    );
  }
}

const StyledPlugins = withStyles(styles)(Plugins);
export { StyledPlugins as Plugins };
