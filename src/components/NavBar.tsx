import { ReactElement, useState, useEffect } from "react";
import {
  AppBar,
  Avatar,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Link, useNavigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import { HtmlTooltip } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";

import { useAuth } from "@/hooks/use-auth";
import {
  ProductsNavbar,
  ProductNavbarData,
  BaseProductIcon,
} from "@/components";
import { DominateStore } from "@/store";
import { Annotate } from "@/wrappers";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: `${theme.palette.secondary.light} !important`,
    height: "90px",
    paddingTop: "9px",
    justifyContent: "space-between",
  },
  svgMedium: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
  },
  avatarUser: {
    width: "40px !important",
    height: "40px !important",
    backgroundColor: `${theme.palette.text.secondary} !important`,
    "&:hover": {
      backgroundColor: `${theme.palette.text.secondary} !important`,
    },
  },
  menuItem: {
    opacity: "1",
    "&:hover": {
      background: theme.palette.primary.main,
    },
    "& a": {
      color: theme.palette.text.primary,
      textDecoration: "none",
      fontSize: "1rem",
      display: "inline-flex",
    },
  },
  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
  productSectionGrid: {
    paddingTop: "0px",
    marginLeft: "30px",
  },
  productSectionDiv: {
    display: "flex",
  },
  navGrid: {
    height: "90px",
  },
  navLinks: {
    height: "100%",
    alignItems: "center",
    display: "flex",
  },
  accessibleSvg: {
    fill: "#000000",
  },
  accessibleName: {
    color: "#000000",
  },
  productLocation: {
    border: "1px solid",
    borderColor: "#DADDE9",
    borderRadius: "9px",
    height: "42px",
    verticalAlign: "middle",
    fontFamily: "Roboto",
    fontWeight: "500",
    fontSize: "0.875rem",
    lineHeight: "1.75",
    display: "flex",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  productLocationText: {
    margin: "auto",
  },
  productLocationImage: {
    margin: "auto",
    paddingRight: "10px",
    height: "40px",
    width: "40px",
  },
  document: {
    margin: "auto",
    marginLeft: "40px",
    padding: "10px",
    height: "65px",
  },
}));

interface Props {
  productSection: JSX.Element | null;
  productNavbarData: ProductNavbarData;
}
export const NavBar = (props: Props): ReactElement | null => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const navigate = useNavigate();
  const classes = useStyles();
  const [userInitials, setUserInitials] = useState("");
  const [anchorElement, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!auth?.userProfile?.name) return;
    const initials = auth?.userProfile?.name
      .split(" ")
      .map((l) => l[0].toUpperCase())
      .join("");
    setUserInitials(initials);
  }, [auth]);

  const hasNavbar = (): boolean =>
    ![
      "/signin",
      "/signup",
      "/reset-password",
      "/request-recover",
      "/recover",
    ].includes(window.location.pathname);

  // If the URL begins with /annotate/ the productSection is rendered
  const hasProductSection = (): boolean =>
    window.location.pathname.startsWith("/annotate/");

  if (!auth) return null;
  if (!hasNavbar()) return null;

  // TODO: owners who are on free plan should still be able to upgrade
  const showBilling =
    auth?.userProfile?.id &&
    auth?.userProfile?.id === auth?.userProfile?.team.owner_id;

  const accountMenu = (
    <>
      <IconButton onClick={handleClick} aria-controls="menu" size="large">
        <HtmlTooltip
          title={<Typography>Account</Typography>}
          placement="bottom"
        >
          <Avatar variant="circular" className={classes.avatarUser}>
            {userInitials}
          </Avatar>
        </HtmlTooltip>
      </IconButton>
      <Menu
        anchorEl={anchorElement}
        keepMounted
        open={Boolean(anchorElement)}
        onClose={handleClose}
        id="menu"
        style={{ marginTop: "60px !important", marginLeft: "80px" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem className={classes.menuItem}>
          <Link to="/account" onClick={() => setAnchorEl(null)}>
            <SVG
              src={imgSrc("account-settings")}
              className={classes.svgMedium}
              style={{ marginRight: "12px" }}
            />
            Account Settings
          </Link>
        </MenuItem>
        {showBilling ? (
          <MenuItem className={classes.menuItem}>
            <Link to="/billing" onClick={() => setAnchorEl(null)}>
              <SVG
                src={imgSrc("account-settings")}
                className={classes.svgMedium}
                style={{ marginRight: "12px" }}
              />
              Billing
            </Link>
          </MenuItem>
        ) : null}
        <MenuItem
          className={classes.menuItem}
          onClick={() =>
            auth.signout().then(() => {
              navigate("signin");
              setAnchorEl(null);
            })
          }
        >
          <SVG
            src={imgSrc("log-out")}
            className={classes.svgMedium}
            style={{ marginRight: "12px" }}
          />
          Log out
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <AppBar position="sticky" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row" justifyContent="space-between">
          <Grid className={classes.logo}>
            <img
              src={imgSrc("gliff-web-master-black")}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
          <div className={classes.productSectionDiv}>
            <ProductsNavbar productNavbarData={props.productNavbarData} />
            {hasProductSection() ? (
              <Grid className={classes.productSectionGrid}>
                {props.productSection}
              </Grid>
            ) : null}
          </div>

          <Grid className={classes.navGrid}>
            <nav className={classes.navLinks}>
              <div className={classes.productLocation}>
                <img
                  className={classes.productLocationImage}
                  src={imgSrc(props.productNavbarData.productLocationIcon)}
                  alt="ANNOTATE"
                />
                <p className={classes.productLocationText}>{props.productNavbarData.productLocation}</p>
              </div>
              <img
                className={classes.document}
                src={imgSrc("document")}
                alt="help-center"
              />
              {auth.user ? (
                <>{accountMenu}</>
              ) : (
                <Typography>
                  <Link to="/signin">Sign In</Link>
                  &nbsp;
                  <Link to="/signup">Sign Up</Link>
                </Typography>
              )}
            </nav>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
