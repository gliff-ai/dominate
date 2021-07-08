import { ChangeEvent, FormEvent, useState } from "react";

import { apiRequest } from "@/api";
import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  makeStyles,
  Container,
} from "@material-ui/core";
import { theme } from "@/theme";
import { Message } from "@/components/Message";

const useStyles = makeStyles(() => ({
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
  text: {
    fontSize: "20px",
    fontWeight: 400,
    textAlign: "center",
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
    marginTop: "50px",
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
    marginTop: "45px",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "15px",
    width: "169px",
    "&:hover": {
      backgroundColor: "none",
    },
  },
}));

export const RequestRecoverAccount = (): JSX.Element => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRecoveryEmail(event.target.value);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      setLoading(true);

      // Reset any errors
      setRecoveryError("");

      await apiRequest("/user/recover", "POST", {
        email: recoveryEmail,
      });

      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.error(e);

      setRecoveryError("Couldn't send email");
    }
  };

  const successBanner = success ? "Email sent" : "";

  return (
    <>
      <div className={classes.text}>
        Enter your email address to request a recovery link. You will need your
        recovery key to compelete the process.
      </div>

      <form onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
          className={classes.textFieldBackground}
          required
          fullWidth
          id="email"
          name="recoveryEmail"
          type="email"
          onChange={handleChange}
          value={recoveryEmail}
          placeholder="E-mail"
        />
        <Message severity="success" message={successBanner} />
        <div className={classes.submitDiv}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Request Recovery
          </Button>
        </div>
        <Message severity="error" message={recoveryError} />
      </form>
    </>
  );
};
