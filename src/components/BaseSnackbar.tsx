import { ReactElement, ComponentType } from "react";
import {
  Snackbar,
  SnackbarContent,
  SlideProps,
  Theme,
  makeStyles,
} from "@material-ui/core";

const useStyle = makeStyles((theme: Theme) => ({
  snackbar: {
    background: theme.palette.info.light,
  },
}));

type TransitionProps = Omit<SlideProps, "direction">;

interface Props {
  open: boolean;
  handleClose: () => void;
  message: ReactElement;
  transition: ComponentType<TransitionProps> | null;
}

function BaseSnackbar({
  open,
  handleClose,
  message,
  transition,
}: Props): ReactElement {
  const classes = useStyle();
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      TransitionComponent={transition}
    >
      <SnackbarContent className={classes.snackbar} message={message} />
    </Snackbar>
  );
}

export { BaseSnackbar, Props as BaseSnackbarProps, TransitionProps };
