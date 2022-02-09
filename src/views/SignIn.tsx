import { useState, ReactElement } from "react";
import {
  TextField,
  Link,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";
import { theme, WarningSnackbar } from "@gliff-ai/style";
import SVG from "react-inlinesvg";
import { useAuth } from "@/hooks/use-auth";
import { MessageAlert, SubmitButton } from "@/components";
import { imgSrc } from "@/imgSrc";

const useStyles = makeStyles(() => ({
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
  svgSmall: {
    width: "22px",
    height: "100%",
    marginLeft: "7px",
    marginRight: "9px",
    marginTop: "0px",
    marginBottom: "-4px",
  },
}));

export function SignIn(): ReactElement | null {
  const classes = useStyles();
  const auth = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [storeError, setStoreError] = useState({});
  const [login, setLogin] = useState({
    email: "",
    password: "",
    showPassword: false,
  });

  if (!auth) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setLogin((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSnackbar = () => {
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
          navigate("/");
        })
        .catch((e) => {
          handleSnackbar();
          setLoading(false);
          setLogin({ email: "", password: "", showPassword: false });

          if (e instanceof Error) {
            // eslint-disable-next-line no-console
            setStoreError(e.message);
          }
        });
    }
  };

  return (
    <>
      <form onSubmit={onFormSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
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
        <MessageAlert severity="error" message={nameError} />

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
                  size="large"
                >
                  <SVG
                    src={imgSrc("show-or-hide-password")}
                    className={classes.svgSmall}
                    fill={
                      login.showPassword
                        ? theme.palette.primary.main
                        : undefined
                    }
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography className={classes.forgotPasswordText}>
          <Link color="secondary" href="/request-recover">
            Recover My Account
          </Link>
        </Typography>

        <SubmitButton loading={loading} value="Continue" />

        <div className={classes.noAccount}>
          <Typography className={classes.noAccountText}>
            Don&apos;t have an account yet or been invited to a team?
          </Typography>
          <Link color="secondary" href="/signup" variant="body2">
            Sign Up
          </Link>
        </div>
      </form>

      <WarningSnackbar
        open={open}
        onClose={handleClose}
        messageText={
          String(storeError).includes("Wrong password for user.")
            ? "Login Failed. Your username and/or password do not match"
            : "There was an error logging you in. Please try again"
        }
      />
    </>
  );
}
