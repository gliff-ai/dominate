/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  ComponentType,
} from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  TextField,
  Link,
  Typography,
  makeStyles,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import { useNavigate } from "react-router-dom";
import { theme } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";
import { createCheckoutSession, getInvite } from "@/services/user";
import { RecoveryKey } from "@/views/RecoveryKey";
import {
  MessageSnackbar,
  MessageAlert,
  TransitionProps,
  SubmitButton,
} from "@/components";

const stripePromise = loadStripe(
  "pk_test_51IVYtvFauXVlvS5w0UZBrzMK5jOZStppHYgoCBLXsZjOKkyqLWC9ICe5biwlYcDZ8THoXtOlPXXPX4zptGjJa1J400IAI0fEAo"
);

const query = new URLSearchParams(window.location.search);

const useStyles = makeStyles(() => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  textFieldBackground: {
    background: theme.palette.primary.light,
  },
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

export const SignUp = (): JSX.Element => {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();

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

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamId: null as number,
    inviteId: null as string,
    acceptedTermsAndConditions: false,
  });

  const TransitionUp = (props: TransitionProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Slide {...props} direction="up" />
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked } = event.target;
    if (id === "acceptedTermsAndConditions") {
      // in this case use the checkbox
      setSignUp({
        ...signUp,
        [id]: checked,
      });
    } else {
      setSignUp({
        ...signUp,
        [id]: value,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const redirectUser = async (): Promise<void> => {
    try {
      // Create and update their profile
      setLoading(false);

      if (!tierId || inviteId) {
        navigate("/"); // It's the free plan or an invite so don't bill them
        return;
      }

      const stripe = await stripePromise;

      const { id: sessionId } = await createCheckoutSession(tierId);

      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
      }
    } catch (e) {
      setRecoveryKey(null);

      if (e instanceof Error) {
        setEtebaseError(e.message);
      }
    }
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset any errors
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setTermsAndConditionsError("");
    setLoading(true);

    const isValid = validate();

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const user = await auth.signup(signUp.email, signUp.password);

      const { profile, recoveryKey: keys } = await auth.createProfile(
        signUp.name,
        signUp.teamId,
        signUp.inviteId,
        signUp.acceptedTermsAndConditions
      );
      setRecoveryKey(keys);
    } catch (e) {
      handleSnackbar(TransitionUp);
      setLoading(false);
      setSignUp({
        ...signUp,
        password: "",
        confirmPassword: "",
      });
      setEmailError("");
      setNameError("");
      setPasswordError("");
      setTermsAndConditionsError("");

      if (e instanceof Error) {
        setEtebaseError(e.message);
      }
    }
  };

  return recoveryKey ? (
    <RecoveryKey recoveryKey={recoveryKey} callback={redirectUser} />
  ) : (
    <>
      <form className={classes.form} onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
          className={classes.textFieldBackground}
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
          className={classes.textFieldBackground}
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
          className={classes.textFieldBackground}
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
          className={classes.textFieldBackground}
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
              I agree to the gliff.ai{" "}
              <Link
                color="secondary"
                target="_blank"
                rel="noopener"
                href="https://gliff.ai/platform-terms-and-conditions/"
              >
                terms and conditions
              </Link>{" "}
              and{" "}
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
};
