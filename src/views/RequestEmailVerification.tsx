import { ChangeEvent, FormEvent, useState } from "react";

import { TextField, makeStyles, Typography } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/api";
import { MessageAlert, SubmitButton } from "@/components";

export const RequestEmailVerification = (): JSX.Element => {
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

      await apiRequest("/user/verify_email", "POST", {
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
      <Typography variant="body1" align="center">
        Enter your email address to request a new verification email. <br />
        <br /> Without a verified account you will not be able to use the
        gliff.ai platform.
      </Typography>

      <form onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
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

        <SubmitButton loading={loading} value="Request" />
        <MessageAlert severity="error" message={requestError} />
      </form>
    </>
  );
};
