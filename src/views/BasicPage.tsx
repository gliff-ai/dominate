import { Container, makeStyles, Typography } from "@material-ui/core";
import { imgSrc, theme } from "@/theme";

const useStyles = makeStyles(() => ({
  typogragphyTitle: {
    width: "100%",
    textAlign: "center",
    fontSize: "34px",
    fontWeight: 700,
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    textAlign: "center",
    marginTop: "75px",
    marginBottom: "75px",
  },

  mainBlock: {
    alignSelf: "center",
    // alignItems: "center",
  },
}));

interface Props {
  view: JSX.Element;
  title: JSX.Element;
}
export const BasicPage = (props: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{ display: "flex", flexDirection: "column", marginTop: 0 }}
    >
      <div className={classes.logo}>
        <img
          src={imgSrc("gliff-web-master-black")}
          alt="gliff logo"
          width="194px"
          height="148px"
        />
      </div>
      <div className={classes.mainBlock}>
        <Typography className={classes.typogragphyTitle}>
          {props.title}
        </Typography>

        <div className={classes.paper}>{props.view}</div>
      </div>
    </Container>
  );
};
