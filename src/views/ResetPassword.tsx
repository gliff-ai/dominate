import { ReactElement, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import {
  TextField,
  makeStyles,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import { theme } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";
import { DominateStore } from "@/store";
import { MessageAlert, SubmitButton } from "@/components";
import { imgSrc } from "@/imgSrc";

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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

interface Props {
  storeInstance: DominateStore;
}

export const ResetPassword = (props: Props): ReactElement => {
  const classes = useStyles();
  const auth = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [storeError, setStoreError] = useState({});
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
            setStoreError(e.message);
          }
        });
    }
  };

  if (!props.storeInstance) {
    return <Navigate to="/signin" />;
  }

  return !auth.user ? (
    <></>
  ) : (
    <div className={classes.paper}>
      <form onSubmit={onFormSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
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
                  id="newPasswordButton"
                >
                  <SVG
                    src={imgSrc("show-or-hide-password")}
                    className={classes.svgSmall}
                    id="newPasswordSvg"
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
        <MessageAlert severity="error" message={passwordError} />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
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
                    src={imgSrc("show-or-hide-password")}
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

        <SubmitButton loading={loading} value="Change Password" />
      </form>
    </div>
  );
};
