import React, { useState } from "react";
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
  InputAdornment,
  SnackbarContent,
  Slide,
  SlideProps,
} from "@material-ui/core";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, theme } from "@/theme";
import SVG from "react-inlinesvg";

type TransitionProps = Omit<SlideProps, "direction">;

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "187px",
  },

  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },

  forgotPasswordText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.secondary.main,
    textAlign: "right",
    fontStyle: "italic",
  },
  noAccount: {
    width: "200%",
    marginBottom: "187px",
  },
  noAccountText: {
    display: "inline",
    marginRight: "10px",
  },

  submitDiv: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
  },
  typogragphyTitle: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "-40px",
    fontSize: "34px",
    fontWeight: 700,
  },
  textFieldBackground: {
    background: theme.palette.primary.light,
  },
  snackbar: {
    background: theme.palette.info.light,
  },
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "9px",
    marginTop: "0px",
    marginBottom: "-4px",
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
  submit: {
    color: theme.palette.text.primary,
    marginBottom: "112px",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "15px",
    width: "169px",
    "&:hover": {
      backgroundColor: "none",
    },
  },
}));

export function SignIn() {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [transition, setTransition] =
    React.useState<React.ComponentType<TransitionProps> | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});
  const [login, setLogin] = useState({
    email: "",
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

  const TransitionUp = (props: TransitionProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Slide {...props} direction="up" />
  );

  const handleSnackbar = (Transition: React.ComponentType<TransitionProps>) => {
    setTransition(() => Transition);
    setOpen(true);
  };

  const handleClickShowPassword = () => {
    setLogin({ ...login, showPassword: !login.showPassword });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validate = () => {
    let nameErrorMessage = "";
    if (!login.email.includes("@")) {
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
        .signin(login.email, login.password)
        .then(() => {
          setLoading(false);
          navigate("home");
        })
        .catch((e) => {
          handleSnackbar(TransitionUp);
          setLoading(false);
          setLogin({ email: "", password: "", showPassword: false });

          if (e instanceof Error) {
            // eslint-disable-next-line no-console
            setEtebaseError(e.message);
          }
        });
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
          <Typography className={classes.typogragphyTitle}>Login</Typography>
        </div>
        <div className={classes.paper}>
          <form className={classes.form} onSubmit={onFormSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              className={classes.textFieldBackground}
              required
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              type="text"
              onChange={handleChange}
              value={login.email}
              placeholder="E-mail"
            />
            <div style={{ color: "red", fontSize: 12 }}>{nameError}</div>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              className={classes.textFieldBackground}
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
            <Typography className={classes.forgotPasswordText}>
              <Link color="secondary" href="/request-recover/*">
                Recover My Account
              </Link>
            </Typography>

            <div className={classes.submitDiv}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {loading ? <CircularProgress color="inherit" /> : "Continue"}
              </Button>
            </div>
            <div className={classes.noAccount}>
              <Typography className={classes.noAccountText}>
                Don&apos;t have an account yet or been invited to a team?
              </Typography>
              <Link color="secondary" href="/signup" variant="body2">
                Sign Up
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
                    {String(etebaseError).includes("Wrong password for user.")
                      ? "Login Failed. Your username and/or password do not match"
                      : "There was an error logging you in. Please try again"}
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
    </ThemeProvider>
  );
}
