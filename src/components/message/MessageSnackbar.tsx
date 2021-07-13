import SVG from "react-inlinesvg";
import { IconButton, makeStyles, Theme } from "@material-ui/core";
import { imgSrc } from "@/theme";
import { BaseSnackbar, BaseSnackbarProps } from "../BaseSnackbar";

const useStyle = makeStyles((theme: Theme) => ({
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "9px",
    marginTop: "0px",
    marginBottom: "-4px",
  },
  message: {
    display: "inline-block",
    marginRight: "5px",
    marginLeft: "5px",
    fontSize: "16px",
  },
  iconButton: {
    color: theme.palette.primary.light,
  },
  svgSmallClose: {
    width: "15px",
    height: "100%",
    marginLeft: "11px",
    marginRight: "0px",
    marginTop: "-3px",
    marginBottom: "0px",
    fill: theme.palette.primary.light,
  },
}));

interface Props extends Omit<BaseSnackbarProps, "message"> {
  messageText: string;
}

function MessageSnackbar({
  open,
  handleClose,
  messageText,
  transition,
}: Props) {
  const classes = useStyle();
  return (
    <BaseSnackbar
      open={open}
      handleClose={handleClose}
      transition={transition}
      message={
        <span>
          <SVG src={imgSrc("warning")} className={classes.svgSmall} />

          <div className={classes.message}>{messageText}</div>
          <IconButton
            size="small"
            aria-label="close"
            onClick={handleClose}
            className={classes.iconButton}
          >
            <SVG src={imgSrc("close")} className={classes.svgSmallClose} />
          </IconButton>
        </span>
      }
    />
  );
}

export { MessageSnackbar };
