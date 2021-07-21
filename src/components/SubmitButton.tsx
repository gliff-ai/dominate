import { theme } from "@gliff-ai/style";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import { ReactElement } from "react";

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
  disabled?: boolean;
  value: string;
}

function SubmitButton(props: Props): ReactElement {
  const classes = useStyles();

  return (
    <div className={classes.submitDiv}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={props.disabled}
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
}

SubmitButton.defaultProps = {
  disabled: false,
};

export { SubmitButton, Props as SubmitButtonProps };
