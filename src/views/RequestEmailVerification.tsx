import { ChangeEvent, FormEvent, useState } from "react";

import { apiRequest } from "@/api";
import { TextField, makeStyles } from "@material-ui/core";
import { theme } from "@/theme";
import { MessageAlert, SubmitButton } from "@/components";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles(() => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },

  forgotPasswordText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.secondary.main,
    textAlign: "right",
    fontStyle: "italic",
  },
  noAccount: {
    width: "200%",
    marginBottom: "187px",
  },
  noAccountText: {
    display: "inline",
    marginRight: "10px",
  },
  text: {
    fontSize: "20px",
    fontWeight: 400,
    textAlign: "center",
  },
  textFieldBackground: {
    background: theme.palette.primary.light,
    marginTop: "50px",
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
}));

export const RequestEmailVerification = (): JSX.Element => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [verifiableEmail, setVerifiableEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVerifiableEmail(event.target.value);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      setLoading(true);

      // Reset any errors
      setRequestError("");
      setTimeout(() => navigate("/signin"), 3000);

      await apiRequest("/verify_email/", "POST", {
        email: verifiableEmail,
      });

      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.error(e);

      setRequestError("Couldn't send email");
    }
  };

  const successBanner = success ? "Email sent" : "";

  return (
    <>
      <div className={classes.text}>
        Enter your email address to request a new verification email. Without a
        verified account you will not be able to use the gliff.ai platform.
      </div>

      <form onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
          className={classes.textFieldBackground}
          required
          fullWidth
          id="email"
          name="verifiableEmail"
          type="email"
          onChange={handleChange}
          value={verifiableEmail}
          placeholder="E-mail"
        />
        <MessageAlert severity="success" message={successBanner} />

        <SubmitButton loading={loading} value="Request Email Verification" />
        <MessageAlert severity="error" message={requestError} />
      </form>
    </>
  );
};
