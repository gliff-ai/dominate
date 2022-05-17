import { ChangeEvent, ReactElement, useState } from "react";
import { Typography, Card, FormControlLabel, Checkbox } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { black, theme } from "@gliff-ai/style";
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
    color: black,
    fontSize: "21px",
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
  const [checboxTicked, setCheckboxTicked] = useState<boolean>(false);

  const classes = useStyles();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCheckboxTicked(event.target.checked);
  };

  return (
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
        <em> only</em> time you will be shown. We <em>do not</em> store your
        recovery key, if you lose this we will be unable to recover your data
        attached to the account.
      </Typography>

      <div
        className={classes.submitDiv}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <FormControlLabel
          control={
            <Checkbox
              id="confirmRecoveryKeyIsSaved"
              checked={checboxTicked}
              onChange={handleChange}
            />
          }
          label={
            <Typography>
              I confirm I have saved my recovery key and understand I won&apos;t
              be able to recover my account and data without it.
            </Typography>
          }
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            callback();
          }}
        >
          <SubmitButton
            disabled={!checboxTicked}
            value="Continue"
            loading={false}
          />
        </form>
      </div>
    </>
  );
}
