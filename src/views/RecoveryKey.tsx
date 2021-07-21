import { ReactElement } from "react";
import { Button, Typography, makeStyles, Card } from "@material-ui/core";
import { theme } from "@gliff-ai/style";

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
  recoveryKey: string[];
  callback: () => void;
}

export function RecoveryKey({ recoveryKey, callback }: Props): ReactElement {
  const classes = useStyles();

  return (
    <>
      <Card className={classes.card}>
        <Typography className={classes.cardTypography}>
          {recoveryKey.join(" ")}
        </Typography>
      </Card>

      <Typography className={classes.recoveryKeyText}>
        This is YOUR randomly generate recovery key.
      </Typography>
      <Typography className={classes.recoveryKeyParagraph}>
        Please keep your recovery key stored in a safe place as this is the
        <span className={classes.spanBold}> ONLY</span> time you will be shown.
        We <span className={classes.spanBold}>DO NOT</span> store your own
        recovery key, if you lose this we will be unable to recover your data
        attached to the account.
      </Typography>

      <div className={classes.submitDiv}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={callback}
        >
          I Understand
        </Button>
      </div>
    </>
  );
}
