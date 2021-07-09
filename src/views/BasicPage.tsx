import { Container, makeStyles, Typography } from "@material-ui/core";
import { imgSrc, theme, lightGrey } from "@/theme";

const squiggles = imgSrc("squig-black", "png");

const useStyles = makeStyles(() => ({
  "@global": {
    body: {
      backgroundImage: `url(${squiggles}),url(${squiggles})`,
      backgroundColor: lightGrey,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "-350px -320px, 1400px 650px",
    },
  },
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
