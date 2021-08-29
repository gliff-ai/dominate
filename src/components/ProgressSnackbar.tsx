import { CircularProgress, makeStyles } from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import { BaseSnackbar } from "@gliff-ai/style";
import { ReactElement } from "react";

const useStyle = makeStyles({
  messageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    fontWright: 500,
  },
  progress: { marginLeft: "5px", color: "#ffffff" },
});

type Task = { isLoading: boolean; description: string };

interface Props {
  task: Task;
  setTask: (task: Task) => void;
}

function ProgressSnackbar({ task, setTask }: Props): ReactElement {
  const classes = useStyle();

  const handleClose = () => {
    setTask({ isLoading: false, description: "" } as Task);
  };

  return (
    <BaseSnackbar
      open={task.isLoading}
      handleClose={handleClose}
      transition={Slide}
      message={
        <div className={classes.messageContainer}>
          {`${task.description} in progress, please wait..`}
          <CircularProgress size="2rem" className={classes.progress} />
        </div>
      }
    />
  );
}

export { ProgressSnackbar, Task };
