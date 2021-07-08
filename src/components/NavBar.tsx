import {
  AppBar,
  Avatar,
  colors,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import { ReactElement, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SVG from "react-inlinesvg";

import { useAuth } from "../hooks/use-auth";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: `${theme.palette.secondary.light} !important`,
    height: "90px",
    paddingTop: "9px",
    marginBottom: "30px",
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
}));

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);

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
    // TODO: Add path for all pages that should not have a navbar
    !["/signin", "/signup", "/reset-password", "/request-recover/*"].includes(
      window.location.pathname
    );

  return hasNavbar() ? (
    <AppBar position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row" alignContent="space-between">
          <Grid className={classes.logo}>
            <img
              src={require(`@/assets/gliff-web-master-black.svg`) as string}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
          <Grid className={classes.navGrid}>
            <nav className={classes.navLinks}>
              {auth.user ? (
                <>
                  <Link to="/curate">
                    <HtmlTooltip
                      title={<Typography color="inherit">CURATE</Typography>}
                      placement="top"
                    >
                      <Avatar variant="circular">
                        <SVG
                          src={require(`@/assets/curate.svg`) as string}
                          className={classes.svgMedium}
                        />
                      </Avatar>
                    </HtmlTooltip>
                  </Link>
                  &nbsp;
                  <Link to="/annotate">
                    <HtmlTooltip
                      title={<Typography color="inherit">ANNOTATE</Typography>}
                      placement="top"
                    >
                      <Avatar variant="circular">
                        <SVG
                          src={require(`@/assets/annotate.svg`) as string}
                          className={classes.svgMedium}
                        />
                      </Avatar>
                    </HtmlTooltip>
                  </Link>
                  &nbsp;
                  <Link to="/manage/projects">
                    <HtmlTooltip
                      title={<Typography color="inherit">MANAGE</Typography>}
                      placement="top"
                    >
                      <Avatar variant="circular">
                        <SVG
                          src={require(`@/assets/manage.svg`) as string}
                          className={classes.svgMedium}
                        />
                      </Avatar>
                    </HtmlTooltip>
                  </Link>
                  &nbsp;
                  <IconButton onClick={handleClick} aria-controls="menu">
                    <HtmlTooltip
                      title={<Typography>Account</Typography>}
                      placement="top"
                    >
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
                    <Paper
                      className={classes.paper}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Avatar
                        className={classes.avatarUser}
                        style={{ margin: "12px" }}
                      >
                        H
                      </Avatar>
                    </Paper>
                    <MenuItem
                      component="a"
                      href="/account"
                      className={classes.menuItem}
                    >
                      <SVG
                        src={require(`@/assets/account-settings.svg`) as string}
                        className={classes.svgMedium}
                        style={{ marginRight: "12px" }}
                      />
                      Account Settings
                    </MenuItem>
                    <MenuItem
                      className={classes.menuItem}
                      onClick={() =>
                        auth.signout().then(() => navigate("signin"))
                      }
                    >
                      <SVG
                        src={require(`@/assets/log-out.svg`) as string}
                        className={classes.svgMedium}
                        style={{ marginRight: "12px" }}
                      />
                      Log out
                    </MenuItem>
                  </Menu>
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
  ) : null;
};
