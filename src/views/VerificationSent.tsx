import { ReactElement } from "react";
import { Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { theme } from "@gliff-ai/style";
import { useNavigate } from "react-router-dom";
import { SubmitButton } from "@/components";

const useStyles = makeStyles(() => ({
  verificationSentParagraph: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.secondary,
    fontSize: 13,
    textAlign: "center",
    width: "519px",
  },

  verificationSentText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.primary,
    fontSize: 21,
    fontWeight: 700,
    width: "150%",
    textAlign: "center",
  },
}));

export function VerificationSent(): ReactElement {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <>
      <Typography className={classes.verificationSentText}>
        A verification email has been sent
      </Typography>
      <Typography className={classes.verificationSentParagraph}>
        Please check your inbox, your account will remain disabled until your
        email address is verified. Once this is complete, you can sign in below
      </Typography>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/signin");
        }}
      >
        <SubmitButton value="Sign In" loading={false} />
      </form>
    </>
  );
}
