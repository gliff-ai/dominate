import React, { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "./hooks/use-auth";

export const Navbar = (): ReactElement => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <div>
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
