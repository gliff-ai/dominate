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
  InputAdornment,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import CloseIcon from "@material-ui/icons/Close";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, theme } from "@/theme";
import SVG from "react-inlinesvg";

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
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    color: theme.palette.text.primary,
  },
  svgSmall: {
    width: "22px",
    height: "100%",
  },
}));

export function SignIn() {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [open, setOpen] = useState(false);
  const [login, setLogin] = useState({
    name: "",
    password: "",
    showPassword: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setLogin((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setLogin({ ...login, showPassword: !login.showPassword });
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
          navigate("home");
        })
        .catch((err) => {
          setOpen(true);
          setLoading(false);
          setLogin({ name: "", password: "", showPassword: false });
        });
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
              name="name"
              autoComplete="email"
              type="text"
              onChange={handleChange}
              value={login.name}
              placeholder="E-mail"
            />
            <div style={{ color: "red", fontSize: 12 }}>{nameError}</div>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              type={login.showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={login.password}
              onChange={handleChange}
              placeholder="Password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      <SVG
                        src={
                          require("../assets/show-or-hide-password.svg") as string
                        }
                        className={classes.svgSmall}
                        fill={
                          login.showPassword ? theme.palette.primary.main : null
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {loading ? <CircularProgress color="inherit" /> : "Log In"}
            </Button>
            <Grid item xs>
              <Link href="/signUp" variant="body2">
                Don&apos;t have an account? Sign Up
              </Link>
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
    </ThemeProvider>
  );
}
