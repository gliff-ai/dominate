import {
  Dialog,
  Card,
  Paper,
  Typography,
  DialogActions,
  Button,
  Theme,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = () =>
  makeStyles((theme: Theme) => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
    projectsTypography: {
      color: "#000000",
      display: "inline",
      fontSize: "21px",
      marginRight: "125px",
    },
  }));

export function ConfirmationDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  heading: string;
  message: string;
  okCallback: () => void;
}) {
  const classes = useStyles()();

  return (
    <Dialog open={props.open}>
      <Card>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.projectsTypography}>
            {props.heading}
          </Typography>
        </Paper>
        <Typography style={{ margin: "10px" }}>{props.message}</Typography>
        <DialogActions>
          <Button
            onClick={() => {
              props.setOpen(false);
              void props.okCallback();
            }}
            color="primary"
          >
            OK
          </Button>
          <Button
            onClick={() => {
              props.setOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Card>
    </Dialog>
  );
}

export function MessageDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  heading: string;
  message: string;
  okCallback?: () => void;
}) {
  const classes = useStyles()();

  return (
    <Dialog open={props.open}>
      <Card>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.projectsTypography}>
            {props.heading}
          </Typography>
        </Paper>
        <Typography style={{ margin: "10px" }}>{props.message}</Typography>
        <DialogActions>
          <Button
            onClick={() => {
              props.setOpen(false);
              if (props.okCallback) {
                void props.okCallback();
              }
            }}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Card>
    </Dialog>
  );
}

MessageDialog.defaultProps = { okCallback: null };
