import React, { useState } from "react";
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
import {useHistory, useNavigate} from "react-router-dom";

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
  const navigate("home"  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});

  const [signUp, setSignUp] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    let nameErrorMessage = "";
    let passwordErrorMessage = "";

    if (signUp.password !== signUp.confirmPassword) {
      passwordErrorMessage = "Passwords do not match";
    }
    if (passwordErrorMessage) {
      setPasswordError(passwordErrorMessage);
      return false;
    }
    if (!signUp.name.includes("@")) {
      nameErrorMessage = "Invalid email";
    }
    if (nameErrorMessage) {
      setNameError(nameErrorMessage);
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

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = validate();

    if (isValid) {
      setLoading(true);
      auth
        .signup(signUp.name, signUp.password)
        .then(() => {
          setLoading(false);
          navigate("home");
        })
        .catch((err) => {
          setOpen(true);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setEtebaseError(err.message);
          setLoading(false);
          setSignUp({ name: "", password: "", confirmPassword: "" });
          setNameError("");
          setPasswordError("");
        });
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
            id="name"
            label="Email Address"
            name="name"
            autoComplete="email"
            autoFocus
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
            label="Password"
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
