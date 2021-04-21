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

export function SignIn() {
  const classes = useStyles();
  const auth = useAuth();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [open, setOpen] = useState(false);
  const [login, setLogin] = useState({
    name: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setLogin((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validate = () => {
    let nameErrorMessage = "";
    if (!login.name.includes("@")) {
      nameErrorMessage = "Invalid email";
    }
    if (nameErrorMessage) {
      setNameError(nameErrorMessage);
      return false;
    }
    return true;
  };

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = validate();
    if (isValid) {
      setLoading(true);
      auth
        .signin(login.name, login.password)
        .then(() => {
          setLoading(false);
          history.push("/");
        })
        .catch((err) => {
          setOpen(true);
          setLoading(false);
          setLogin({ name: "", password: "" });
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
          Sign in
        </Typography>
        <form className={classes.form} onSubmit={onFormSubmit}>
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
            value={login.name}
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
            value={login.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {loading ? <CircularProgress color="inherit" /> : "Sign In"}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/signUp" variant="body2">
                Don&apos;t have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </form>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          message="Login Failed. Your username and/or password do not match"
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
    </Container>
  );
}
