/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  ComponentType,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  TextField,
  Link,
  Typography,
  makeStyles,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";
import { createCheckoutSession, getInvite } from "@/services/user";
import { RecoveryKey } from "@/views/RecoveryKey";
import { MessageSnackbar, MessageAlert, SubmitButton } from "@/components";
import { VerificationSent } from "@/views/VerificationSent";

const stripePromise = loadStripe(
  "pk_test_51IVYtvFauXVlvS5w0UZBrzMK5jOZStppHYgoCBLXsZjOKkyqLWC9ICe5biwlYcDZ8THoXtOlPXXPX4zptGjJa1J400IAI0fEAo"
);

const query = new URLSearchParams(window.location.search);

const useStyles = makeStyles(() => ({
  haveAccount: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "187px",
  },
  haveAccountText: {
    display: "inline",
    marginRight: "20px",
  },
}));

type State =
  | "1-Signup"
  | "2-RecoveryKey"
  | "3-BillingFailed"
  | "4-VerificationSent";

interface Props {
  // eslint-disable-next-line react/require-default-props
  state?: State;
}
export const SignUp = (props: Props): JSX.Element => {
  const classes = useStyles();
  const auth = useAuth();

  const [state, setState] = useState<State>(props.state || "1-Signup");
  const [open, setOpen] = useState(false);
  const [transition, setTransition] =
    useState<ComponentType<TransitionProps> | null>(null);

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});
  const [termsAndConditionsError, setTermsAndConditionsError] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string[] | null>(null);
  const [user, setUser] = useState<{ email: string; id: number } | null>(null);

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamId: null as number,
    inviteId: null as string,
    acceptedTermsAndConditions: false,
  });

  const TransitionUp = (p: TransitionProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Slide {...p} direction="up" />
  );

  const handleSnackbar = (Transition: ComponentType<TransitionProps>) => {
    setTransition(() => Transition);
    setOpen(true);
  };

  const tierId = query.get("tier_id") || null;
  const inviteId = query.get("invite_id") || null;

  useEffect(() => {
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
  }, []);

  const validate = () => {
    if (signUp.password !== signUp.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    if (signUp.acceptedTermsAndConditions === false) {
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

      const { profile, recoveryKey: keys } = await auth.createProfile(
        signUp.name,
        signUp.teamId,
        signUp.inviteId,
        signUp.acceptedTermsAndConditions
      );

      setUser(profile);
      setRecoveryKey(keys);
      setState("2-RecoveryKey");
    } catch (e) {
      handleSnackbar(TransitionUp);
      setLoading(false);
      setSignUp({
        ...signUp,
        password: "",
        confirmPassword: "",
      });
      clearErrors();

      if (e instanceof Error) {
        setEtebaseError(e.message);
      }
    }
  };

  const billing = async () => {
    if (!tierId || inviteId) {
      setState("4-VerificationSent");
      return;
    }

    const stripe = await stripePromise;

    const { id: sessionId } = await createCheckoutSession(
      tierId,
      user.id,
      user.email
    );

    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
      sessionId,
    });

    if (result.error) {
      console.error(result.error);
    }
  };

  const signupForm = (
    <>
      <form onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          name="email"
          autoComplete="email"
          autoFocus
          type="email"
          onChange={handleChange}
          value={signUp.email}
          placeholder="E-mail *"
        />
        <MessageAlert severity="error" message={emailError} />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="name"
          name="name"
          autoComplete="full_name"
          type="text"
          onChange={handleChange}
          value={signUp.name}
          placeholder="Name *"
        />
        <MessageAlert severity="error" message={nameError} />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={signUp.password}
          onChange={handleChange}
          placeholder="Password *"
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          type="password"
          id="confirmPassword"
          autoComplete="current-password"
          value={signUp.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password *"
        />
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

        <div className={classes.haveAccount}>
          <Typography className={classes.haveAccountText} variant="body2">
            Already have an account?&nbsp;
            <Link color="secondary" href="/signin">
              Sign In
            </Link>
          </Typography>
        </div>
      </form>

      {/* Looks like that account already exists, try another email! */}
      <MessageSnackbar
        open={open}
        handleClose={handleClose}
        transition={transition}
        messageText={
          String(etebaseError).includes("duplicate key")
            ? "Looks like that account already exists, try another email!"
            : "There was an error creating an account"
        }
      />
    </>
  );

  if (state === "1-Signup") {
    return signupForm;
  }

  if (state === "2-RecoveryKey") {
    return <RecoveryKey recoveryKey={recoveryKey} callback={billing} />;
  }

  if (state === "3-BillingFailed") {
    // This should be infrequent as Stripe will normally catch errors within Checkout
    return (
      <>
        <p>
          There was an error processing your payment. Please&nbsp;
          <Link color="secondary" href="/signin">
            Sign In
          </Link>
          &nbsp; and upgrade your account from the billing page
        </p>

        <p>Alternatively, contact us at support@gliff.ai for help</p>
      </>
    );
  }

  if (state === "4-VerificationSent") {
    return <VerificationSent />;
  }

  return <></>;
};
