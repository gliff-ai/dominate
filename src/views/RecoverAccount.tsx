import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { theme } from "@gliff-ai/style";
import { TextField, Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { getRecoverySession } from "@/services/user";
import { DominateStore } from "@/store";
import { MessageAlert, SubmitButton } from "@/components";
import { useMountEffect } from "@/hooks/use-mountEffect";
import { RecoveryKeyDialog } from "@/components/RecoveryKeyDialog";

const useStyles = makeStyles(() => ({
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
}));

const query = new URLSearchParams(window.location.search);

interface Props {
  storeInstance: DominateStore;
}

export const RecoverAccount = (props: Props): JSX.Element => {
  const classes = useStyles();
  const { storeInstance } = props;
  const navigate = useNavigate();
  const [recoverySession, setRecoverySession] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string[] | null>(null);
  const [recover, setRecover] = useState({
    newPassword: "",
    recoveryKey: "",
  });

  useMountEffect(() => {
    const queryUid = query.get("uid");
    if (!queryUid) return;
    void getRecoverySession(query.get("uid") as string).then(
      ({ recovery_key }) => {
        setRecoverySession(recovery_key);
      }
    );
  });

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

    const restoredSession = await storeInstance.restoreSession(
      recoverySession,
      recover.recoveryKey,
      recover.newPassword
    );

    if (restoredSession) {
      setLoading(false);
      setRecoveryKey(restoredSession.recoveryKey);
    } else {
      setRecoveryError(
        "Couldn't recover account with those details. Please contact support@gliff.ai."
      );
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
      <RecoveryKeyDialog recoveryKey={recoveryKey} />
      <form onSubmit={onSubmitForm}>
        <TextField
          variant="outlined"
          margin="normal"
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

        <SubmitButton loading={loading} value="Continue" />

        <MessageAlert severity="error" message={recoveryError} />

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
