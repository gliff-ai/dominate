import { ReactElement, ComponentType } from "react";
import { Alert } from "@material-ui/lab";
import SVG from "react-inlinesvg";
import {
  Snackbar,
  SnackbarContent,
  IconButton,
  makeStyles,
  Theme,
  SlideProps,
} from "@material-ui/core";

interface MessageProps {
  message: string;
  severity: "info" | "warning" | "error" | "success";
}

function Message({ message, severity }: MessageProps): ReactElement {
  return message && <Alert severity={severity}>{message}</Alert>;
}

const useStyle = makeStyles((theme: Theme) => ({
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "9px",
    marginTop: "0px",
    marginBottom: "-4px",
  },
  snackbar: {
    background: theme.palette.info.light,
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

type TransitionProps = Omit<SlideProps, "direction">;
interface SnackbarProps {
  open: boolean;
  handleClose: () => void;
  message: string;
  transition: ComponentType<TransitionProps> | null;
}

function BaseSnackbar({
  open,
  handleClose,
  message,
  transition,
}: SnackbarProps): ReactElement {
  const classes = useStyle();
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      TransitionComponent={transition}
    >
      <SnackbarContent
        className={classes.snackbar}
        message={
          <span>
            <SVG
              src={require(`@/assets/warning.svg`) as string}
              className={classes.svgSmall}
            />

            <div className={classes.message}>{message}</div>
            <IconButton
              size="small"
              aria-label="close"
              onClick={handleClose}
              className={classes.iconButton}
            >
              <SVG
                src={require(`@/assets/close.svg`) as string}
                className={classes.svgSmallClose}
              />
            </IconButton>
          </span>
        }
      />
    </Snackbar>
  );
}

export { Message, BaseSnackbar, TransitionProps };
