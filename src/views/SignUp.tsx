/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Typography,
  makeStyles,
  Container,
  CircularProgress,
  Snackbar,
  IconButton,
  SnackbarContent,
} from "@material-ui/core";
import SVG from "react-inlinesvg";

import Slide, { SlideProps } from "@material-ui/core/Slide";

import { useNavigate } from "react-router-dom";
import { ThemeProvider, theme } from "@/theme";

import { useAuth } from "@/hooks/use-auth";
import { createCheckoutSession, getInvite } from "@/services/user";

type TransitionProps = Omit<SlideProps, "direction">;

const stripePromise = loadStripe(
  "pk_test_51IVYtvFauXVlvS5w0UZBrzMK5jOZStppHYgoCBLXsZjOKkyqLWC9ICe5biwlYcDZ8THoXtOlPXXPX4zptGjJa1J400IAI0fEAo"
);
const query = new URLSearchParams(window.location.search);

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  logo: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "187px",
  },
  typogragphyTitle: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "-40px",
    fontSize: "34px",
    fontWeight: 700,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  textFieldBackground: {
    background: theme.palette.primary.light,
  },
  snackbar: {
    background: theme.palette.info.main,
  },
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "11px",
    marginTop: "0px",
    marginBottom: "-5px",
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
  submitDiv: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginTop: "86px",
  },
  submit: {
    color: theme.palette.text.primary,
    marginBottom: "60px",
    textTransform: "none",
    width: "169px",
    fontWeight: 700,
    fontSize: "15px",
  },
}));

export const SignUp = (): JSX.Element => {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [transition, setTransition] =
    React.useState<React.ComponentType<TransitionProps> | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamId: null as number,
    inviteId: null as string,
  });

  const TransitionUp = (props: TransitionProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Slide {...props} direction="up" />
  );

  const handleSnackbar = (Transition: React.ComponentType<TransitionProps>) => {
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
        });
      });
    }
  }, []);

  const validate = () => {
    if (signUp.password !== signUp.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setSignUp({
      ...signUp,
      [id]: value,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset any errors
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setLoading(true);

    const isValid = validate();

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const user = await auth.signup(signUp.email, signUp.password);

      const { profile, recoveryKey } = await auth.createProfile(
        signUp.name,
        signUp.teamId,
        signUp.inviteId
      );

      // TODO show this somewhere
      console.log(recoveryKey);

      const instance = auth.getInstance();

      const project = await instance.createCollection("Default Collection");
      // Create and update their profile
      setLoading(false);

      if (!tierId || inviteId) {
        navigate("home"); // It's the free plan or an invite so don't bill them
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
      handleSnackbar(TransitionUp);
      setLoading(false);
      setSignUp({ ...signUp, name: "", password: "", confirmPassword: "" });
      setEmailError("");
      setNameError("");
      setPasswordError("");

      if (e instanceof Error) {
        setEtebaseError(e.message);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.logo}>
        <img
          src={require("../assets/gliff-web-master-black.svg") as string}
          alt="gliff logo"
          width="194px"
          height="148px"
        />
      </div>
      <div>
        <Typography className={classes.typogragphyTitle}>
          Create an Account
        </Typography>
      </div>
      <div className={classes.paper}>
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
          <div style={{ color: "red", fontSize: 12 }}>{emailError}</div>
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
          <div style={{ color: "red", fontSize: 12 }}>{nameError}</div>
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
          <div style={{ color: "red", fontSize: 12 }}>{passwordError}</div>
          <div className={classes.submitDiv}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {loading ? <CircularProgress color="inherit" /> : "Next"}
            </Button>
          </div>

          <div className={classes.haveAccount}>
            <Typography className={classes.haveAccountText}>
              Already have an account?
            </Typography>
            <Link color="secondary" href="/signin" variant="body2">
              Sign In
            </Link>
          </div>
        </form>

        <Snackbar
          open={open}
          onClose={handleClose}
          TransitionComponent={transition}
        >
          <SnackbarContent
            className={classes.snackbar}
            message={
              <span>
                <SVG
                  src={require(`../assets/warning.svg`) as string}
                  className={classes.svgSmall}
                />

                <div className={classes.message}>
                  {/* Looks like that account already exists, try another email! */}
                  {String(etebaseError).includes("duplicate key")
                    ? "Looks like that account already exists, try another email!"
                    : "There was an error creating an account"}
                </div>

                <IconButton
                  size="small"
                  aria-label="close"
                  onClick={handleClose}
                  className={classes.iconButton}
                >
                  <SVG
                    src={require(`../assets/close.svg`) as string}
                    className={classes.svgSmallClose}
                  />
                </IconButton>
              </span>
            }
          />
        </Snackbar>
      </div>
    </Container>
  );
};
