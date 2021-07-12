import { ReactElement } from "react";
import { makeStyles, Theme, CircularProgress } from "@material-ui/core";

const useStyle = makeStyles((theme: Theme) => ({
  mainDiv: {
    position: "absolute",
    backgroundColor: theme.palette.secondary.light,
    width: "100%",
    height: "100%",
    zIndex: 101,
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
}));

interface Props {
  isLoading: boolean;
}

function PageSpinner(props: Props): ReactElement {
  const classes = useStyle();

  return props.isLoading ? (
    <div className={classes.mainDiv}>
      <CircularProgress
        size="6rem"
        color="primary"
        className={classes.spinner}
      />
    </div>
  ) : null;
}

export { PageSpinner };
