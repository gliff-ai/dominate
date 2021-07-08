import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRecoverySession } from "@/services/user";
import { DominateEtebase } from "@/etebase";
import { theme } from "@/theme";
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Typography,
  makeStyles,
  Container,
  CircularProgress,
} from "@material-ui/core";
import { Message } from "@/components/Message";

const useStyles = makeStyles(() => ({
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

const query = new URLSearchParams(window.location.search);

interface Props {
  etebaseInstance: DominateEtebase;
}

export const RecoverAccount = (props: Props): JSX.Element => {
  const classes = useStyles();
  const { etebaseInstance } = props;
  const navigate = useNavigate();
  const [recoverySession, setRecoverySession] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recover, setRecover] = useState({
    newPassword: "",
    recoveryKey: "",
  });

  useEffect(() => {
    if (query.get("uid")) {
      void getRecoverySession(query.get("uid")).then(({ recovery_key }) => {
        setRecoverySession(recovery_key);
      });
    }
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRecover({
      ...recover,
      [name]: value,
    });
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Reset any errors
    setRecoveryError("");

    // Convert their input to the format we expect
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const restoredSession = await etebaseInstance.restoreSession(
      recoverySession,
      recover.recoveryKey,
      recover.newPassword
    );

    if (restoredSession) {
      setLoading(false);
      navigate("/signin");
    } else {
      setRecoveryError("Couldn't recover account with those details");
    }
  };

  if (!recoverySession) {
    return (
      <>
        <h1>Invalid Recovery Token.</h1>
        <div>It may have expired, try requesting another one.</div>
      </>
    );
  }

  return (
    <>
      <form className={classes.form} onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
          className={classes.textFieldBackground}
          required
          fullWidth
          name="recoveryKey"
          type="text"
          onChange={handleChange}
          value={recover.recoveryKey}
          placeholder="Recovery Key"
        />
        <TextField
          variant="outlined"
          margin="normal"
          type="password"
          required
          fullWidth
          className={classes.textFieldBackground}
          name="newPassword"
          id="newPassword"
          autoComplete="new-password"
          value={recover.newPassword}
          onChange={handleChange}
          placeholder="New Password"
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
            {loading ? (
              <CircularProgress size="1.5rem" color="inherit" />
            ) : (
              "Continue"
            )}
          </Button>
          <Message severity="error" message={recoveryError} />
        </div>
        <div className={classes.noAccount}>
          <Typography className={classes.noAccountText}>
            Don&apos;t have an account yet?
          </Typography>
          <Link color="secondary" href="/signup">
            Sign Up
          </Link>
        </div>
      </form>
    </>
  );
};
