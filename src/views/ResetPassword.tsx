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
} from "@material-ui/core";
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
  noAccountDiv: {
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
    marginTop: "86px",
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

  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "9px",
    marginTop: "0px",
    marginBottom: "-4px",
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

export function ResetPassword() {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    showPassword: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setPassword((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setPassword({
      ...password,
      showPassword: !password.showPassword,
    });
  };

  const validate = () => {
    if (password.currentPassword !== password.newPassword) {
      setPasswordError("Password do not match");
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
        .signin(password.currentPassword, password.newPassword)
        .then(() => {
          setLoading(false);
          navigate("home");
        })
        .catch((e) => {
          setLoading(false);
          setPassword({
            currentPassword: "",
            newPassword: "",
            showPassword: false,
          });

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
            Reset Password
          </Typography>
        </div>
        <div className={classes.paper}>
          <form className={classes.form} onSubmit={onFormSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              className={classes.textFieldBackground}
              name="currentPassword"
              type={password.showPassword ? "text" : "password"}
              id="currentPassword"
              value={password.currentPassword}
              onChange={handleChange}
              placeholder="New Password"
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
                          password.showPassword
                            ? theme.palette.primary.main
                            : null
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div style={{ color: "red", fontSize: 12 }}>{passwordError}</div>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              className={classes.textFieldBackground}
              name="newPassword"
              type={password.showPassword ? "text" : "password"}
              id="newPassword"
              value={password.newPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
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
                          password.showPassword
                            ? theme.palette.primary.main
                            : null
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className={classes.submitDiv}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Change Password
              </Button>
            </div>
            <div className={classes.noAccountDiv}>
              <Typography className={classes.noAccountText}>
                Don&apos;t have an account yet or been invited to a team?
              </Typography>
              <Link color="secondary" href="/signup" variant="body2">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </Container>
    </ThemeProvider>
  );
}
