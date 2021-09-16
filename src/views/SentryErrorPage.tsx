import { ReactElement } from "react";
import { Typography, makeStyles, Card, Link } from "@material-ui/core";
import { theme, BaseTextButton } from "@gliff-ai/style";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles(() => ({
  divButtons: {
    display: "flex",
    marginTop: "50px",
    "& $button": {
      marginRight: "80px",
      marginLeft: "50px",
    },
  },

  subHeading: {
    fontSize: "28px",
    fontWeight: 700,
    marginTop: "-40px",
  },

  typography: {
    fontSize: "20px",
    textAlign: "center",
  },
}));

export function SentryErrorPage(): ReactElement {
  const classes = useStyles();

  return (
    <>
      <p className={classes.subHeading}>An Unexpected Error has Occurred</p>
      <p className={classes.typography}>
        Please report the problem to us below if it persists or alternatively
        try reloading the application.
      </p>
      <div className={classes.divButtons}>
        <BaseTextButton
          text="Report Error"
          onClick={() => window.open("https://gliff.ai/privacy-policy/")}
        />
        <BaseTextButton text="Reload App" onClick={() => {window.location.reload(); return false;}} />
      </div>
    </>
  );
}
