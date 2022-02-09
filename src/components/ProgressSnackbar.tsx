import {
  CircularProgress,
  Typography,
  Box,
  Snackbar,
  SnackbarContent,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { theme } from "@gliff-ai/style";

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
  snackbarContent: { backgroundColor: theme.palette.info.light },
});

type Task = { isLoading: boolean; description: string; progress?: number };

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
    <Snackbar open={task.isLoading} onClose={handleClose}>
      <SnackbarContent
        className={classes.snackbarContent}
        message={
          <div className={classes.messageContainer}>
            {`${task.description} in progress, please wait...`}
            <Box style={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant={
                  task.progress !== undefined ? "determinate" : "indeterminate"
                }
                value={task.progress}
                size={task.progress === undefined ? "2rem" : "3rem"}
                className={classes.progress}
              />
              {task.progress !== undefined && (
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography component="div">{`${task.progress}%`}</Typography>
                </Box>
              )}
            </Box>
          </div>
        }
      />
    </Snackbar>
  );
}

export { ProgressSnackbar, Task };
