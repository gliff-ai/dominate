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
    color: theme.palette.text.secondary,
    fontSize: 13,
    width: "150%",
  },
  noAccount: {
    width: "200%",
    marginBottom: "187px",
  },
  noAccountText: {
    display: "inline",
    marginRight: "10px",
  },
  home: {
    height: "53px",
    backgroundColor: theme.palette.primary.light,
    width: "61px",
    top: "22px",
    right: "20px",
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

export function RecoverAccount() {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});
  const [login, setLogin] = useState({
    email: "",
    recoveryKey: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setLogin((prevState) => ({
      ...prevState,
      [id]: value,
    }));
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
        .signin(login.email, login.recoveryKey)
        .then(() => {
          setLoading(false);
          navigate("home");
        })
        .catch((e) => {
          setLoading(false);
          setLogin({ email: "", recoveryKey: "" });

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
          <Typography className={classes.typogragphyTitle}>
            Recover my Account
          </Typography>
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
              name="recovery key"
              id="recoveryKey"
              autoComplete="current-password"
              value={login.recoveryKey}
              onChange={handleChange}
              placeholder="Recovery Key"
            />
            <Typography className={classes.forgotPasswordText}>
              * Your recovery key was provided to you when you first signed up
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
              <Link color="secondary" href="/signup">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </Container>
    </ThemeProvider>
  );
}
