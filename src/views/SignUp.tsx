import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "react-router-dom";

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
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = validate();

    if (isValid) {
      setLoading(true);
      auth
        .signup(signUp.name, signUp.password)
        .then(() => {
          setLoading(false);
          history.push("/");
        })
        .catch((err) => {
          alert(err);
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
            {loading ? "Loading..." : "Sign Up"}
          </Button>

          <Grid container>
            <Grid item>
              <Link href="/signin" variant="body2">
                Already have an account? Sign In
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};
