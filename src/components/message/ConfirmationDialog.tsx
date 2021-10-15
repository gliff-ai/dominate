import {
  Dialog,
  Card,
  Paper,
  Typography,
  DialogActions,
  Button,
  makeStyles,
  Theme,
} from "@material-ui/core";

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

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  heading: string;
  message: string;
  okCallback: () => void;
}

export function ConfirmationDialog(props: Props) {
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
