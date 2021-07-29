import { ReactElement } from "react";
import { Avatar, makeStyles, Link, Theme } from "@material-ui/core";
import SVG from "react-inlinesvg";
import { imgSrc } from "@/imgSrc";

const useStyles = makeStyles((theme: Theme) => ({
  productSvg: {
    width: "39px",
    height: "39px",
  },
  productAvatar: {
    position: "relative",
    margin: "0 auto",
  },
  iconDiv: {
    display: "flex",
    justifyContent: "center",
    marginTop: "5px",
    marginLeft: "10px",
    marginRight: "10px",
    flexDirection: "column",
  },
  productName: {
    fontWeight: 500,
    marginTop: "5px",
    textTransform: "uppercase",
  },
  trailSvg: {
    width: "7px",
    height: "7px",
    marginTop: -30,
    position: "relative",
    fill: theme.palette.text.secondary,
  },
  outerDiv: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
}));

interface Props {
  tool: string;
  customUrlPath?: string;
  linkDisabled?: boolean;
  extraStyleAvatar?: string | null;
  extraStyleSvg?: string | null;
  extraStyleName?: string | null;
  extraStyleTrailSvg?: string | null;
}

function BaseProductIcon({
  tool,
  customUrlPath,
  linkDisabled,
  extraStyleAvatar,
  extraStyleSvg,
  extraStyleName,
  extraStyleTrailSvg,
}: Props): ReactElement {
  const classes = useStyles();

  const avatar = (
    <Avatar
      variant="circular"
      className={`${classes.productAvatar} ${extraStyleAvatar}`}
    >
      <SVG
        src={imgSrc(tool)}
        className={`${classes.productSvg} ${extraStyleSvg}`}
      />
    </Avatar>
  );

  return (
    <div className={classes.outerDiv}>
      <div className={classes.iconDiv}>
        {linkDisabled ? (
          avatar
        ) : (
          <Link href={customUrlPath || `/${tool}`}>{avatar}</Link>
        )}
        <p className={`${classes.productName} ${extraStyleName}`}>{tool}</p>
      </div>
      {tool !== "annotate" && (
        <SVG
          src={imgSrc("breadcrumb-trail")}
          className={`${classes.trailSvg} ${extraStyleTrailSvg}`}
        />
      )}
    </div>
  );
}

BaseProductIcon.defaultProps = {
  linkDisabled: false,
  extraStyleAvatar: null,
  extraStyleSvg: null,
  extraStyleName: null,
  extraStyleTrailSvg: null,
  customUrlPath: null,
};

export { BaseProductIcon };
