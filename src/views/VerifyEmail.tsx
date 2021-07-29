import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { theme } from "@gliff-ai/style";
import { Link, Typography, makeStyles } from "@material-ui/core";
import { MessageAlert, SubmitButton } from "@/components";
import { apiRequest } from "@/api";

const useStyles = makeStyles(() => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },

  noAccount: {
    width: "200%",
    marginBottom: "187px",
  },
  noAccountText: {
    display: "inline",
    marginRight: "10px",
  },
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

export const VerifyEmail = (): JSX.Element => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { uid } = useParams(); // uid of user from URL
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const onLoadForm = async (): Promise<void> => {
    try {
      setLoading(true);

      // Reset any errors
      setRequestError("");

      await apiRequest<boolean>(`/user/verify_email/${uid}`, "GET");

      setLoading(false);
    } catch (e) {
      console.log(e);
      setRequestError("Account not verified");
    }
  };

  const onSubmitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/");
  };

  useEffect(() => {
    void onLoadForm();
  }, []);

  return (
    <>
      <form className={classes.form} onSubmit={onSubmitForm}>
        {!loading ? (
          <Typography className={classes.recoveryKeyText}>
            Thank you for verifying your email address.
          </Typography>
        ) : (
          <Typography className={classes.recoveryKeyParagraph}>
            Your gliff.ai account is being verified...
          </Typography>
        )}

        <SubmitButton
          loading={loading}
          disabled={loading}
          value="Take me to the platform"
        />

        <MessageAlert severity="error" message={requestError} />

        <div className={classes.noAccount}>
          <Typography className={classes.noAccountText}>
            Don&apos;t have an account yet?
          </Typography>
          <Link color="secondary" href="/signup">
            Sign Up
          </Link>
        </div>
      </form>
    </>
  );
};
