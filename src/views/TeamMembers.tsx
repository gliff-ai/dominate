import {
  Button,
  CssBaseline,
  Link,
  Typography,
  makeStyles,
  Container,
  Card,
  IconButton,
  Avatar,
} from "@material-ui/core";
import { theme } from "@/theme";
import SVG from "react-inlinesvg";

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: "519px",
    height: "67px",
    border: "4px solid white",
    display: "flex",
  },

  cardTypography: {
    textAlign: "center",
    padding: "19px 0",
    width: "60%",
  },
  logo: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "187px",
  },

  forgotPasswordText: {
    marginTop: "38px",
    color: theme.palette.text.secondary,
    fontSize: 13,
    textAlign: "center",
    width: "519px",
  },

  buttons: {
    display: "flex",
    gap: "25px",
  },

  text: {
    marginBottom: "26px",
    marginTop: "26px",
    color: theme.palette.text.secondary,
    fontSize: 13,
  },

  typographyText: {
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

  submitDiv: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
  },
  createATeamButton: {
    backgroundColor: theme.palette.info.main,
    marginBottom: "112px",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "15px",
    width: "169px",
    "&:hover": {
      backgroundColor: "none",
    },
  },
  typogragphyTitle: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "100px",
    fontSize: "34px",
    fontWeight: 700,
    marginTop: "-60px",
  },
  textFieldBackground: {
    background: theme.palette.primary.light,
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
  svgMedium: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
    backgroundColor: theme.palette.primary.light,
  },
}));

export function TeamMembers() {
  const classes = useStyles();

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
          Team Members
        </Typography>
      </div>
      <div className={classes.paper}>
        <Typography className={classes.typographyText}>
          Looks like someone has already invited you!{" "}
        </Typography>
        <Card className={classes.card}>
          <Typography className={classes.cardTypography}>
            ghost-road-silver-3
          </Typography>
          <IconButton className={classes.iconButton}>
            <Avatar variant="circular">
              <SVG
                src={require(`../assets/add.svg`) as string}
                className={classes.svgMedium}
              />
            </Avatar>
          </IconButton>
        </Card>
        <Typography className={classes.forgotPasswordText}>
          Do you want to join their team? Just click the ADD button to accept
          and you will automatically be connected to their team.
        </Typography>
        <Typography className={classes.text}>- or -</Typography>
        <div className={classes.buttons}>
          <div className={classes.submitDiv}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.createATeamButton}
            >
              Create a Team
            </Button>
          </div>

          <div className={classes.submitDiv}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Skip this Step
            </Button>
          </div>
        </div>
        <div className={classes.haveAccount}>
          <Typography className={classes.haveAccountText}>
            Already have an account?
          </Typography>
          <Link color="secondary" href="/signin" variant="body2">
            Sign In
          </Link>
        </div>
      </div>
    </Container>
  );
}
