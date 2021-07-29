import { ReactElement, useState } from "react";
import { Button, Typography, makeStyles, Card } from "@material-ui/core";
import { theme } from "@/theme";
import { VerificationSent } from "@/views/VerificationSent";

const useStyles = makeStyles(() => ({
  card: {
    width: "519px",
    height: "67px",
    border: "4px solid white",
  },

  cardTypography: {
    textAlign: "center",
    padding: "19px 0",
  },

  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  recoveryKeyParagraph: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.secondary,
    fontSize: 13,
    textAlign: "center",
    width: "519px",
    "& em": {
      fontWeight: "bold",
      textTransform: "uppercase",
      fontStyle: "normal",
    },
  },

  spanBold: {
    fontWeight: "bold",
    color: theme.palette.text.primary,
  },

  recoveryKeyText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.primary,
    fontSize: 21,
    fontWeight: 700,
    width: "150%",
    textAlign: "center",
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
  textFieldBackground: {
    background: theme.palette.primary.light,
  },
  snackbar: {
    background: theme.palette.info.light,
  },
  message: {
    display: "inline-block",
    marginRight: "5px",
    marginLeft: "5px",
    fontSize: "16px",
  },
  haveAccount: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "187px",
  },
  haveAccountText: {
    display: "inline",
    marginRight: "20px",
  },
  iconButton: {
    color: theme.palette.primary.light,
  },
  submit: {
    textTransform: "none", // This is set to uppercase globally, shouldn't be?
    marginTop: "10px",
    "&:hover": {
      backgroundColor: "none",
    },
  },
}));

interface Props {
  recoveryKey: string[];
  callback: () => void;
}

export function RecoveryKey({ recoveryKey, callback }: Props): ReactElement {
  const classes = useStyles();

  const [isUnderstood, setUnderstood] = useState(false);

  return isUnderstood ? (
    <VerificationSent callback={callback} />
  ) : (
    <>
      <Card className={classes.card}>
        <Typography className={classes.cardTypography}>
          {recoveryKey.join(" ")}
        </Typography>
      </Card>

      <Typography className={classes.recoveryKeyText}>
        This is YOUR randomly generated recovery key
      </Typography>
      <Typography className={classes.recoveryKeyParagraph}>
        Please keep your recovery key stored in a safe place as this is the
        <em> only</em> time you will be shown. We <em>do not</em> store your own
        recovery key, if you lose this we will be unable to recover your data
        attached to the account.
      </Typography>

      <div
        className={classes.submitDiv}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div>I have saved my recovery key somewhere safe</div>
        <Button
          type="button"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={() => setUnderstood(true)}
        >
          Continue
        </Button>
      </div>
    </>
  );
}
