import { AppBar, Grid, makeStyles, Toolbar } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeProvider, theme } from "@/theme";

import { useAuth } from "./hooks/use-auth";

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: theme.palette.secondary.light,
    height: "90px",
    paddingTop: "9px",
    marginBottom: "30px",
  },

  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
}));

export const Navbar = (): ReactElement => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const navigate = useNavigate();
  const classes = useStyles();

  return (
    <div>
      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar>
          <Grid container direction="row">
            <Grid item className={classes.logo}>
              <img
                src={require(`./assets/gliff-master-black.svg`) as string}
                width="79px"
                height="60px"
                alt="gliff logo"
              />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <nav>
        {auth.user ? (
          <>
            <Link to="/annotate">ANNOTATE</Link>
            &nbsp;
            <Link to="/curate">CURATE</Link>
            &nbsp;
            <Link to="/manage">MANAGE</Link>
            &nbsp;
            <Link to="/account">{auth.user.username}</Link>
            &nbsp;
            <button
              type="button"
              onClick={() => auth.signout().then(() => navigate("signin"))}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signin">Sign In</Link>
            &nbsp;
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </div>
  );
};
