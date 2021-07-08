import {
  Container,
  CssBaseline,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { imgSrc, theme } from "@/theme";

const useStyles = makeStyles(() => ({
  typogragphyTitle: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "-40px",
    fontSize: "34px",
    fontWeight: 700,
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    marginBottom: "187px",
  },
}));

interface Props {
  view: JSX.Element;
  title: JSX.Element;
}
export const BasicPage = (props: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.logo}>
        <img
          src={imgSrc("gliff-web-master-black")}
          alt="gliff logo"
          width="194px"
          height="148px"
        />
      </div>
      <div>
        <Typography className={classes.typogragphyTitle}>
          {props.title}
        </Typography>
      </div>

      <div className={classes.paper}>{props.view}</div>
    </Container>
  );
};
