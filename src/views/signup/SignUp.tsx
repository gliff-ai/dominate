import React, { useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Typography,
  makeStyles,
  Container,
  CircularProgress,
  Snackbar,
  IconButton,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import CloseIcon from "@material-ui/icons/Close";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "react-router-dom";
import { API_URL } from "@/etebase";
import { createCheckoutSession } from "@/services/user";

const stripePromise = loadStripe(
  "pk_test_51IVYtvFauXVlvS5w0UZBrzMK5jOZStppHYgoCBLXsZjOKkyqLWC9ICe5biwlYcDZ8THoXtOlPXXPX4zptGjJa1J400IAI0fEAo"
);
const query = new URLSearchParams(window.location.search);

const useStyles = makeStyles((theme) => ({
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
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export const SignUp = () => {
  const classes = useStyles();
  const auth = useAuth();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const tierId = query.get("tier_id") || "0";

  const validate = () => {
    if (signUp.password !== signUp.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setSignUp({
      ...signUp,
      [id]: value,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
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

      const profile = await auth.createProfile(signUp.name);

      // Create and update their profile
      setLoading(false);

      if (!tierId) {
        history.push("/"); // It's the free plan so don't bill them
      }

      const stripe = await stripePromise;

      const response = await createCheckoutSession(tierId);

      console.log(response);
      const session = response;
      // console.log(session);
      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
      }
    } catch (e) {
      setOpen(true);
      setLoading(false);
      setSignUp({ name: "", email: "", password: "", confirmPassword: "" });
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
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <form className={classes.form} onSubmit={onSubmitForm}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            type="email"
            onChange={handleChange}
            value={signUp.email}
          />
          <div style={{ color: "red", fontSize: 12 }}>{emailError}</div>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="full_name"
            type="text"
            onChange={handleChange}
            value={signUp.name}
          />
          <div style={{ color: "red", fontSize: 12 }}>{nameError}</div>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={signUp.password}
            onChange={handleChange}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="current-password"
            value={signUp.confirmPassword}
            onChange={handleChange}
          />
          <div style={{ color: "red", fontSize: 12 }}>{passwordError}</div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {loading ? <CircularProgress color="inherit" /> : "Sign Up"}
          </Button>

          <Grid container>
            <Grid item xs>
              <Link href="/signin" variant="body2">
                Already have an account? Sign In
              </Link>
            </Grid>
          </Grid>
        </form>
        <div>
          <Snackbar
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            message={`${etebaseError}`}
            action={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={handleClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            }
          />
        </div>
      </div>
    </Container>
  );
};
