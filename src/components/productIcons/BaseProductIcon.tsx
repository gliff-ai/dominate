import { ReactElement } from "react";
import { Avatar, makeStyles, Theme, Button } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import { imgSrc } from "@/imgSrc";

const useStyles = makeStyles((theme: Theme) => ({
  productButton: {
    minWidth: "unset",
    padding: 0,
  },
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
  // TODO: support target?
  // eslint-disable-next-line react/no-unused-prop-types
  target?: string;
  extraStyleAvatar?: string;
  extraStyleSvg?: string;
  extraStyleName?: string;
  extraStyleTrailSvg?: string;
  auditEnabled?: boolean;
}

function BaseProductIcon({
  tool,
  customUrlPath,
  linkDisabled,
  extraStyleAvatar,
  extraStyleSvg,
  extraStyleName,
  extraStyleTrailSvg,
  auditEnabled,
}: Props): ReactElement {
  const classes = useStyles();
  const navigate = useNavigate();

  

  const avatar = (
    <Avatar
      variant="circular"
      className={
        extraStyleAvatar !== undefined
          ? `${classes.productAvatar} ${extraStyleAvatar}`
          : classes.productAvatar
      }
    >
      <SVG
        src={imgSrc(tool)}
        className={
          extraStyleSvg !== undefined
            ? `${classes.productSvg} ${extraStyleSvg}`
            : classes.productSvg
        }
      />
    </Avatar>
  );

  return (
    <div className={classes.outerDiv}>
      <div className={classes.iconDiv}>
        <Button
          className={classes.productButton}
          onClick={() => navigate(customUrlPath || `/${tool}`)}
          disabled={linkDisabled}
        >
          {avatar}
        </Button>
        <p
          className={
            extraStyleName !== undefined
              ? `${classes.productName} ${extraStyleName}`
              : classes.productName
          }
        >
          {tool}
        </p>
      </div>
      {tool !== "audit" &&
        tool !== "document" &&
        !(tool === "annotate" && !auditEnabled) && ( // don't put an arrow after ANNOTATE if AUDIT is absent from the navbar
          <SVG
            src={imgSrc("breadcrumb-trail")}
            className={
              extraStyleTrailSvg !== undefined
                ? `${classes.trailSvg} ${extraStyleTrailSvg}`
                : classes.trailSvg
            }
          />
        )}
    </div>
  );
}

BaseProductIcon.defaultProps = {
  linkDisabled: false,
  target: "_self",
  extraStyleAvatar: undefined,
  extraStyleSvg: undefined,
  extraStyleName: undefined,
  extraStyleTrailSvg: undefined,
  customUrlPath: null,
  auditEnabled: false,
};

export { BaseProductIcon };
