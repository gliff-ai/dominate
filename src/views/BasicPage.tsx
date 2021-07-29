import { Container, makeStyles, Typography, Button } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { theme, lightGrey } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";

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
  backButton: {
    position: "absolute",
    left: "100px",
    top: "100px",
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
  // eslint-disable-next-line react/require-default-props
  showBackButton?: boolean;
}

export const BasicPage = ({
  view,
  title,
  showBackButton = false,
}: Props): JSX.Element => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{ display: "flex", flexDirection: "column", marginTop: 0 }}
    >
      {showBackButton ? (
        <Button
          type="button"
          onClick={() => navigate(-1)}
          className={classes.backButton}
          color="primary"
          variant="contained"
        >
          BACK
        </Button>
      ) : (
        ""
      )}
      <div className={classes.logo}>
        <img
          src={imgSrc("gliff-web-master-black")}
          alt="gliff logo"
          width="194px"
          height="148px"
        />
      </div>
      <div className={classes.mainBlock}>
        <Typography className={classes.typogragphyTitle}>{title}</Typography>

        <div className={classes.paper}>{view}</div>
      </div>
    </Container>
  );
};
