import { ReactElement } from "react";
import { makeStyles, Paper } from "@material-ui/core";
import { BaseIconButton, theme } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";

interface Props {
  isVisible: boolean;
  hide: () => void;
  width?: string;
  height?: string;
  children?: ReactElement | null;
}

export function PluginModal(props: Props): ReactElement | null {
  const classes = makeStyles({
    paper: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: props.width,
      height: props.height,
      visibility: props.isVisible ? "visible" : "hidden",
      backgroundColor: theme.palette.primary.light,
    },
    closeButtonPosition: {
      position: "absolute",
      top: "3px",
      right: "3px",
    },
    childrenDiv: {
      marginTop: "60px",
      height: "100%",
      width: "100%",
    },
  })(props);

  return (
    <Paper className={classes.paper}>
      <div className={classes.closeButtonPosition}>
        <BaseIconButton
          tooltip={{ name: "Close", icon: imgSrc("close") }}
          onClick={props.hide}
        />
      </div>
      <div className={classes.childrenDiv}>{props.children}</div>
    </Paper>
  );
}

PluginModal.defaultProps = {
  width: "80%",
  height: "80%",
  children: null,
};
