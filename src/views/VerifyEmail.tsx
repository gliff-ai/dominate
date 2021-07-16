import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { theme } from "@/theme";
import {
  TextField,
  Link,
  Typography,
  makeStyles,
  Button,
} from "@material-ui/core";
import { MessageAlert, SubmitButton } from "@/components";
import { apiRequest } from "@/api";

const useStyles = makeStyles(() => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },

  forgotPasswordText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.secondary,
    fontSize: 13,
    width: "150%",
  },
  noAccount: {
    width: "200%",
    marginBottom: "187px",
  },
  noAccountText: {
    display: "inline",
    marginRight: "10px",
  },
  home: {
    height: "53px",
    backgroundColor: theme.palette.primary.light,
    width: "61px",
    top: "22px",
    right: "20px",
  },

  textFieldBackground: {
    background: theme.palette.primary.light,
  },
  snackbar: {
    background: theme.palette.info.light,
  },
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "9px",
    marginTop: "0px",
    marginBottom: "-4px",
    fill: theme.palette.primary.light,
  },
  svgSmallClose: {
    width: "15px",
    height: "100%",
    marginLeft: "11px",
    marginRight: "0px",
    marginTop: "-3px",
    marginBottom: "0px",
    fill: theme.palette.primary.light,
  },
  message: {
    display: "inline-block",
    marginRight: "5px",
    marginLeft: "5px",
    fontSize: "16px",
  },
  iconButton: {
    color: theme.palette.primary.light,
  },
  recoveryKeyParagraph: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.secondary,
    fontSize: 13,
    textAlign: "center",
    width: "519px",
  },

  spanBold: {
    fontWeight: "bold",
    color: theme.palette.text.primary,
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      await apiRequest<boolean>(`/user/verify_email/${uid}`, "GET");

      setLoading(false);
    } catch (e) {
      console.log(e);
      setRequestError("Couldn't verify account with those details");
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
        <Typography className={classes.recoveryKeyText}>
          Thank you for verifying your email address.
        </Typography>
        <Typography className={classes.recoveryKeyParagraph}>
          Your gliff.ai account is being verified..
        </Typography>

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
