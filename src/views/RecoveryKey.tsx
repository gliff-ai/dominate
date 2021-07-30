import { ReactElement, useState } from "react";
import { Typography, makeStyles, Card } from "@material-ui/core";
import { theme } from "@gliff-ai/style";
import { VerificationSent } from "@/views/VerificationSent";
import { SubmitButton } from "@/components";

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
  recoveryKeyText: {
    marginBottom: "44px",
    marginTop: "13px",
    color: theme.palette.text.primary,
    fontSize: 21,
    fontWeight: 700,
    width: "150%",
    textAlign: "center",
  },
  submitDiv: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
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
        <form onSubmit={() => setUnderstood(true)}>
          <SubmitButton value="Continue" loading={false} />
        </form>
      </div>
    </>
  );
}
