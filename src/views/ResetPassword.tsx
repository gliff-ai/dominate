import React, { ReactElement, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SVG from "react-inlinesvg";

import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  makeStyles,
  Container,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import { useAuth } from "@/hooks/use-auth";
import { theme } from "@/theme";
import { DominateEtebase } from "@/etebase";

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

interface Props {
  etebaseInstance: DominateEtebase;
}

export const ResetPassword = (props: Props): ReactElement => {
  const classes = useStyles();
  const auth = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [etebaseError, setEtebaseError] = useState({});
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setPassword((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleClickShowPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (event.currentTarget.id === "newPassword") {
      setPassword({
        ...password,
        showNewPassword: !password.showNewPassword,
      });
    } else {
      setPassword({
        ...password,
        showConfirmPassword: !password.showConfirmPassword,
      });
    }
  };

  const validate = () => {
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("Passwords do not match");
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
        .changePassword(password.newPassword)
        .then(() => {
          setLoading(false);
          // TODO: toast to say success!
          setTimeout(() => navigate("/signin"), 3000);
        })
        .catch((e) => {
          setLoading(false);
          setPassword({
            newPassword: "",
            confirmPassword: "",
            showNewPassword: false,
            showConfirmPassword: false,
          });

          if (e instanceof Error) {
            setEtebaseError(e.message);
          }
        });
    }
  };

  if (!props.etebaseInstance || !auth.user) {
    return <Navigate to="/signin" />;
  }

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
          Change Password
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
            name="newPassword"
            type={password.showNewPassword ? "text" : "password"}
            id="newPassword"
            value={password.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    id="newPassword"
                  >
                    <SVG
                      src={
                        require("../assets/show-or-hide-password.svg") as string
                      }
                      className={classes.svgSmall}
                      id="newPassword"
                      fill={
                        password.showNewPassword
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
            name="confirmPassword"
            type={password.showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={password.confirmPassword}
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
                      id="confirmPassword"
                      fill={
                        password.showConfirmPassword
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
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};
