import { ChangeEvent, FormEvent, useState } from "react";

import { apiRequest } from "@/api";
import { TextField, makeStyles, Typography } from "@material-ui/core";
import { theme } from "@gliff-ai/style";
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
}));

export const RequestRecoverAccount = (): JSX.Element => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRecoveryEmail(event.target.value);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      setLoading(true);

      // Reset any errors
      setRecoveryError("");
      setTimeout(() => navigate("/signin"), 3000);

      await apiRequest("/user/recover", "POST", {
        email: recoveryEmail,
      });

      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.error(e);

      setRecoveryError("Couldn't send email");
    }
  };

  const successBanner = success ? "Email sent" : "";

  return (
    <>
      <Typography variant="body1" align="center">
        Enter your email address to request a recovery link. You will need your
        recovery key to complete the process.
      </Typography>

      <form onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          name="recoveryEmail"
          type="email"
          onChange={handleChange}
          value={recoveryEmail}
          placeholder="E-mail"
        />
        <MessageAlert severity="success" message={successBanner} />

        <SubmitButton loading={loading} value="Request Recovery" />
        <MessageAlert severity="error" message={recoveryError} />
      </form>
    </>
  );
};
