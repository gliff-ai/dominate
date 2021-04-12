import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "./hooks/use-auth";

export const Navbar = (): ReactElement => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth(); // TODO type

  return (
    <div>
      <nav>
        {auth.user ? (
          <>
            <Link to="/annotate">ANNOTATE</Link>&nbsp;
            <Link to="/curate">CURATE</Link>&nbsp;
            <Link to="/account">MANAGE ({auth.user.username})</Link>&nbsp;
            <button type="button" onClick={() => auth.signout()}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/signin">Sign In</Link>
        )}
      </nav>
    </div>
  );
};
