/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ChangeEvent, FormEvent, useState, ReactElement } from "react";
import {
  TextField,
  Link,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import { WarningSnackbar } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";
import { getInvite } from "@/services/user";
import { RecoveryKey } from "@/views/RecoveryKey";
import { MessageAlert, SubmitButton } from "@/components";
import { VerificationSent } from "@/views/VerificationSent";
import { useMountEffect } from "@/hooks/use-mountEffect";

const query = new URLSearchParams(window.location.search);

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  teamId: number | null;
  inviteId: string | null;
  acceptedTermsAndConditions: boolean;
};

type State = "1-Signup" | "2-RecoveryKey" | "3-VerificationSent";

interface Props {
  // eslint-disable-next-line react/require-default-props
  state?: State;
}
export const SignUp = (props: Props): ReactElement | null => {
  const auth = useAuth();

  const [state, setState] = useState<State>(props.state || "1-Signup");
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [storeError, setStoreError] = useState({});
  const [termsAndConditionsError, setTermsAndConditionsError] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string[] | null>(null);

  const [signUp, setSignUp] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamId: null,
    inviteId: null,
    acceptedTermsAndConditions: false,
  });

  const handleSnackbar = () => {
    setOpen(true);
  };

  const tierId = parseInt(query.get("tier_id") || "", 10) || null; // This is only used for custom plans
  const inviteId = query.get("invite_id") || null;

  useMountEffect(() => {
    if (inviteId) {
      // We have an invite, so we know their email, add this to the request
      void getInvite(inviteId).then(({ email, team_id }) => {
        setSignUp({
          teamId: team_id,
          email,
          inviteId,
          name: "",
          password: "",
          confirmPassword: "",
          acceptedTermsAndConditions: false,
        });
      });
    }
  });

  if (!auth) return null;

  const validate = () => {
    if (signUp.password !== signUp.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    if (!signUp.acceptedTermsAndConditions) {
      setTermsAndConditionsError("You must accept our terms and conditions");
      return false;
    }

    return true;
  };

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setTermsAndConditionsError("");
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked, type } = event.target;
    setSignUp({
      ...signUp,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset any errors
    clearErrors();
    setLoading(true);

    const isValid = validate();

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      await auth.signup(signUp.email, signUp.password);

      const profile = await auth.createProfile(
        signUp.name,
        signUp.teamId as number,
        signUp.inviteId as string,
        signUp.acceptedTermsAndConditions,
        tierId as number
      );

      if (profile) {
        setRecoveryKey(profile.recoveryKey);
        setState("2-RecoveryKey");
      }
    } catch (e) {
      handleSnackbar();
      setLoading(false);
      setSignUp({
        ...signUp,
        password: "",
        confirmPassword: "",
      });
      clearErrors();

      if (e instanceof Error) {
        setStoreError(e.message);
      }
    }
  };

  const err = (
    <WarningSnackbar
      open={open}
      onClose={handleClose}
      messageText={
        String(storeError).includes("duplicate key")
          ? "Looks like that account already exists, try another email!"
          : "There was an error creating an account"
      }
    />
  );

  const textField = (
    name: string,
    value: string,
    type: string,
    placeholder: string,
    autocomplete: string = "off",
    autofocus: boolean = false
  ) => (
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id={name}
      name={name}
      autoComplete={autocomplete || name}
      autoFocus={autofocus}
      type={type}
      onChange={handleChange}
      value={value}
      placeholder={placeholder}
    />
  );

  const signupForm = (
    <>
      <form onSubmit={onSubmitForm}>
        {textField("email", signUp.email, "email", "E-mail *", "email", true)}
        <MessageAlert severity="error" message={emailError} />
        {textField("name", signUp.name, "text", "Name *", "full_name")}
        <MessageAlert severity="error" message={nameError} />
        {textField(
          "password",
          signUp.password,
          "password",
          "Password *",
          "new-password"
        )}
        {textField(
          "confirmPassword",
          signUp.confirmPassword,
          "password",
          "Confirm Password *",
          "off"
        )}
        <MessageAlert severity="error" message={passwordError} />

        <FormControlLabel
          control={
            <Checkbox
              id="acceptedTermsAndConditions"
              checked={signUp.acceptedTermsAndConditions}
              onChange={handleChange}
              inputProps={{ "aria-label": "primary checkbox" }}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the gliff.ai&nbsp;
              <Link
                color="secondary"
                target="_blank"
                rel="noopener"
                href="https://gliff.ai/platform-terms-and-conditions/"
              >
                terms and conditions
              </Link>
              &nbsp;and&nbsp;
              <Link
                color="secondary"
                target="_blank"
                rel="noopener"
                href="https://gliff.ai/privacy-policy/"
              >
                privacy policy
              </Link>
              .
            </Typography>
          }
        />
        <MessageAlert severity="error" message={termsAndConditionsError} />

        <SubmitButton loading={loading} value="Next" />

        <div
          style={{
            width: "fit-content",
            marginRight: "auto",
            marginLeft: "auto",
            marginBottom: "187px",
          }}
        >
          <Typography
            style={{ display: "inline", marginRight: "20px" }}
            variant="body2"
          >
            Already have an account?&nbsp;
            <Link color="secondary" href="/signin">
              Sign In
            </Link>
          </Typography>
        </div>
      </form>

      {err}
    </>
  );

  if (state === "1-Signup") {
    return signupForm;
  }

  if (state === "2-RecoveryKey" && recoveryKey) {
    return (
      <>
        <RecoveryKey
          recoveryKey={recoveryKey}
          callback={() => setState("3-VerificationSent")}
        />
        {err}
      </>
    );
  }

  if (state === "3-VerificationSent") {
    return (
      <>
        <VerificationSent />
        {err}
      </>
    );
  }

  return <></>;
};
