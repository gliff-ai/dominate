import { ReactElement, useState } from "react";
import {
  AppBar,
  Avatar,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import { imgSrc } from "@/imgSrc";

import { useAuth } from "@/hooks/use-auth";
import { HtmlTooltip } from "@/components/HtmlTooltip";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: `${theme.palette.secondary.light} !important`,
    height: "90px",
    paddingTop: "9px",
  },
  link: {
    textDecoration: "none",
    marginRight: "10px",
    color: theme.palette.secondary.main,
  },
  svgMedium: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
  },
  paper: {
    borderRadius: 0,
    border: "none",
    boxShadow: "none",
    display: "inline-flex",
    backgroundColor: "#FFFFFF",
    width: "313px",
  },
  avatarUser: {
    width: "64px !important",
    height: "64px !important",
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
  },
  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
  navGrid: {
    marginLeft: "auto",
    alignItems: "center",
    height: "90px",
  },
  navLinks: {
    height: "100%",
    alignItems: "center",
    display: "flex",
  },
  linkTooltip: {
    textTransform: "uppercase",
  },
}));

export const NavBar = (): ReactElement => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const navigate = useNavigate();
  const classes = useStyles();

  const [anchorElement, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const hasNavbar = () =>
    ![
      "/signin",
      "/signup",
      "/reset-password",
      "/request-recover",
      "/recover",
    ].includes(window.location.pathname);

  if (!hasNavbar()) return null;

  const internalLinks = ["annotate", "curate", "manage"].map((tool) => (
    <Link to={`/${tool}`} key={tool}>
      <HtmlTooltip
        title={
          <Typography color="inherit" className={classes.linkTooltip}>
            {tool}
          </Typography>
        }
        placement="top"
      >
        <Avatar variant="circular">
          <SVG
            // eslint-disable-next-line import/no-dynamic-require
            src={require(`@/assets/${tool}.svg`) as string}
            className={classes.svgMedium}
          />{" "}
        </Avatar>
      </HtmlTooltip>
    </Link>
  ));

  const accountMenu = (
    <>
      <IconButton onClick={handleClick} aria-controls="menu">
        <HtmlTooltip title={<Typography>Account</Typography>} placement="top">
          <Avatar variant="circular" className={classes.avatarUser}>
            H
          </Avatar>
        </HtmlTooltip>
      </IconButton>
      <Menu
        anchorEl={anchorElement}
        keepMounted
        open={Boolean(anchorElement)}
        onClose={handleClose}
        id="menu"
        style={{ marginTop: "80px" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem component="a" href="/account" className={classes.menuItem}>
          <SVG
            src={imgSrc("account-settings")}
            className={classes.svgMedium}
            style={{ marginRight: "12px" }}
          />
          Account Settings
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={() => auth.signout().then(() => navigate("signin"))}
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
        <Grid container direction="row" alignContent="space-between">
          <Grid className={classes.logo}>
            <img
              src={imgSrc("gliff-web-master-black")}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
          <Grid className={classes.navGrid}>
            <nav className={classes.navLinks}>
              {auth.user ? (
                <>
                  {internalLinks}

                  {accountMenu}
                </>
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
