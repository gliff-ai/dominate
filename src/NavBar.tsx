import {
  AppBar,
  Avatar,
  Grid,
  makeStyles,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { theme } from "@/theme";
import SVG from "react-inlinesvg";

import { useAuth } from "./hooks/use-auth";

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: theme.palette.secondary.light,
    height: "90px",
    paddingTop: "9px",
    marginBottom: "30px",
  },

  svgMedium: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
  },

  avatar: {
    width: "64px",
    height: "64px",
    backgroundColor: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.text.secondary,
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

const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);

export const Navbar = (): ReactElement => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const navigate = useNavigate();
  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row" alignContent="space-between">
          <Grid item className={classes.logo}>
            <img
              src={require(`./assets/gliff-web-master-black.svg`) as string}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
          <Grid item className={classes.navGrid}>
            <nav className={classes.navLinks}>
              {auth.user ? (
                <>
                  <Link to="/annotate">
                    <HtmlTooltip
                      title={<Typography color="inherit">ANNOTATE</Typography>}
                      placement="top"
                    >
                      <Avatar variant="circular">
                        <SVG
                          src={require(`./assets/annotate.svg`) as string}
                          className={classes.svgMedium}
                        />
                      </Avatar>
                    </HtmlTooltip>
                  </Link>
                  &nbsp;
                  <Link to="/curate">
                    <HtmlTooltip
                      title={<Typography color="inherit">CURATE</Typography>}
                      placement="top"
                    >
                      <Avatar variant="circular">
                        <SVG
                          src={require(`./assets/curate.svg`) as string}
                          className={classes.svgMedium}
                        />
                      </Avatar>
                    </HtmlTooltip>
                  </Link>
                  &nbsp;
                  <Link to="/manage/projects">
                    {" "}
                    <HtmlTooltip
                      title={<Typography color="inherit">MANAGE</Typography>}
                      placement="top"
                    >
                      <Avatar variant="circular">
                        <SVG
                          src={require(`./assets/manage.svg`) as string}
                          className={classes.svgMedium}
                        />
                      </Avatar>
                    </HtmlTooltip>
                  </Link>
                  &nbsp;
                  <Avatar className={classes.avatar}>H</Avatar>
                  {/* <Link to="/account">{auth.user.username}</Link>
                  &nbsp;
                  <button
                    type="button"
                    onClick={() =>
                      auth.signout().then(() => navigate("signin"))
                    }
                  >
                    Sign Out
                  </button> */}
                </>
              ) : (
                <>
                  <Link to="/signin">Sign In</Link>
                  &nbsp;
                  <Link to="/signup">Sign Up</Link>
                </>
              )}
            </nav>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
