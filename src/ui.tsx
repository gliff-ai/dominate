import React, { Component, ChangeEvent, ReactNode } from "react";

import { DominateEtebase } from "@/etebase";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

import { Home } from "./Home.tsx";
import { Curate } from "./Curate.tsx";

import { Navbar } from "@/NavBar";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/SignUp";

import { useAuth } from "@/hooks/use-auth";

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
    loading: boolean;
  };

  constructor(props: Props) {
    super(props);
    this.state = { loading: true };
  }

  selectThing = (type, thing) => {
    console.log(`you selected the ${type} ${thing} thing`);
  };

  componentDidMount() {}

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
          // TODO private routes
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
