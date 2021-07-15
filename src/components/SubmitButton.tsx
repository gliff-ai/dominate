import { theme } from "@/theme";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  submitDiv: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
  },
  submit: {
    color: theme.palette.text.primary,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "15px",
    width: "169px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
    marginBottom: "20px",
    marginTop: "20px",
  },
}));

interface Props {
  loading: boolean;
  value: string;
}

export const SubmitButton = (props: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <div className={classes.submitDiv}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        {props.loading ? (
          <CircularProgress size="1.5rem" color="inherit" />
        ) : (
          props.value
        )}
      </Button>
    </div>
  );
};
