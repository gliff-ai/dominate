import { ReactElement } from "react";
import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Button } from "@gliff-ai/style";

const useStyles = makeStyles(() => ({
  divButtons: {
    marginTop: "40px",
    "& $button": {
      textAlign: "center",
    },
  },

  subHeading: {
    fontSize: "28px",
    fontWeight: 700,
    marginTop: "-40px",
    textAlign: "center",
  },

  typography: {
    fontSize: "20px",
    textAlign: "center",
    marginTop: "40px",
  },
}));

export function UnsupportedScreenSizeErrorPage(): ReactElement {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h3" className={classes.subHeading}>
        This Screen Size is Unsupported
      </Typography>

      <Typography className={classes.typography}>
        You are using a device with a screen size that is too small. For the
        best experience with gliff.ai, please use a larger screen.
      </Typography>

      <div className={classes.divButtons}>
        <Button
          text="Return to Website"
          onClick={() => window.open("https://gliff.ai")}
        />
      </div>
    </>
  );
}
