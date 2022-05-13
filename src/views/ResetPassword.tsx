import { ReactElement, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { theme } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";
import { DominateStore } from "@/store";
import { MessageAlert, SubmitButton } from "@/components";
import { imgSrc } from "@/imgSrc";
import { RecoveryKeyDialog } from "@/components/RecoveryKeyDialog";

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

export const ResetPassword = (props: Props): ReactElement | null => {
  const classes = useStyles();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [storeError, setStoreError] = useState({});
  const [recoveryKey, setRecoveryKey] = useState<string[] | null>(null);

  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
  });

  if (!auth) return null;

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
        .then((result) => {
          setLoading(false);
          setRecoveryKey(result.recoveryKey);
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
      <RecoveryKeyDialog recoveryKey={recoveryKey} />
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
                  size="large"
                >
                  <SVG
                    src={imgSrc("show-or-hide-password")}
                    className={classes.svgSmall}
                    id="newPasswordSvg"
                    fill={
                      password.showNewPassword
                        ? theme.palette.primary.main
                        : undefined
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
                  size="large"
                >
                  <SVG
                    src={imgSrc("show-or-hide-password")}
                    className={classes.svgSmall}
                    id="confirmPassword"
                    fill={
                      password.showConfirmPassword
                        ? theme.palette.primary.main
                        : undefined
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
