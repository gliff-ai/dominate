import React, { Component, ReactNode } from "react";
import { DominateEtebase } from "@/etebase";
import { useAuth } from "@/hooks/use-auth";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/SignUp";
import { Navbar } from "@/NavBar";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import { Home } from "./Home";
import { Curate } from "./Curate";

interface Props {
  etebaseInstance: DominateEtebase;
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
export class UserInterface extends Component<Props> {
  state: {
    collections?: any;
  };

  constructor(props: Props) {
    super(props);
    this.state = { collections: null };
  }

  componentDidMount() {}

  selectThing = (type, thing) => {
    console.log(`you selected the ${type} ${thing} thing`);
  };

  render = (): ReactNode => (
    <Router>
      <div>
        <Navbar />

        <br />
        <br />
        <br />

        <Switch>
          <Route path="/signin">
            <SignIn />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <PrivateRoute path="/annotate">
            <div>TODO</div>
          </PrivateRoute>
          <Route
            path="/curate/:id"
            render={({ match }: any) => (
              <Curate
                etebaseInstance={this.props.etebaseInstance}
                selectedThing={this.selectThing}
                match={match}
              />
            )}
          />
          <Route
            path="/curate/"
            render={({ match }: any) => (
              <Curate
                etebaseInstance={this.props.etebaseInstance}
                selectedThing={this.selectThing}
                match={match}
              />
            )}
          />
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>

      <footer>
        <div>
          {this.state.collections?.map((col) => JSON.stringify(col.getMeta()))}
        </div>
      </footer>
    </Router>
  );
}
