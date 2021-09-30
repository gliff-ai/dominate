import { ReactElement } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { BaseTextButton } from "@gliff-ai/style";

const useStyles = makeStyles(() => ({
  divButtons: {
    marginTop: "70px",
    "& $button": {
      marginRight: "80px",
      marginLeft: "50px",
    },
    textAlign: "center",
  },

  subHeading: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "-40px,72px",
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
      <Typography variant="h3" className={classes.subHeading}>
        An Unexpected Error Has Occurred
      </Typography>

      <Typography className={classes.typography}>
        Please report the problem to us below if it persists or alternatively
        try reloading the application.
      </Typography>

      <div className={classes.divButtons}>
        <BaseTextButton
          text="Report Error"
          onClick={() => window.open("https://gliff.ai/contact/")}
        />
        <BaseTextButton
          text="Reload App"
          onClick={() => {
            window.open("/manage");
            return false;
          }}
        />
      </div>
    </>
  );
}
