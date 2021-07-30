import { ReactElement } from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { theme } from "@gliff-ai/style";
import { SubmitButton } from "@/components";

const useStyles = makeStyles(() => ({
  recoveryKeyParagraph: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.secondary,
    fontSize: 13,
    textAlign: "center",
    width: "519px",
  },

  recoveryKeyText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.primary,
    fontSize: 21,
    fontWeight: 700,
    width: "150%",
    textAlign: "center",
  },
}));

interface Props {
  callback: () => void;
}

export function VerificationSent({ callback }: Props): ReactElement {
  const classes = useStyles();

  return (
    <>
      <Typography className={classes.recoveryKeyText}>
        A verification email has been sent
      </Typography>
      <Typography className={classes.recoveryKeyParagraph}>
        Please check your inbox, your account will remain disabled until your
        email address is verified. Once this is complete, you can sign in below
      </Typography>

      <form onSubmit={callback}>
        <SubmitButton value="Sign In" loading={false} />
      </form>
    </>
  );
}
