import { ReactElement } from "react";
import { makeStyles, Theme, CircularProgress } from "@material-ui/core";

const useStyle = makeStyles((theme: Theme) => ({
  mainDiv: {
    position: "relative",
    margin: "auto",
    marginTop: "50px",
    width: "200px",
    height: "200px",
    zIndex: 101,
  },
  spinner: {
    position: "absolute",
    top: "50px",
    left: "50px",
  },
}));

function LoadingSpinner(): ReactElement | null {
  const classes = useStyle();

  return (
    <div className={classes.mainDiv}>
      <CircularProgress
        size="100px"
        color="primary"
        className={classes.spinner}
      />
    </div>
  );
}

export { LoadingSpinner };
