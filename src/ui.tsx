/* eslint-disable react/jsx-curly-newline */
import React, { Component, ReactNode } from "react";
import { Collection, DominateEtebase, Item } from "@/etebase";
import { useAuth } from "@/hooks/use-auth";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/signup/SignUp";
import { Navbar } from "@/NavBar";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  RouteChildrenProps,
} from "react-router-dom";

import { Home } from "./Home";
import { CurateWrapper } from "./Curate";

type Children =
  | ((props: RouteChildrenProps<any>) => React.ReactNode)
  | React.ReactNode;

interface Props {
  etebaseInstance: DominateEtebase;
  children?: Children;
}

interface State {
  collections?: Collection[];
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
type PrivateProps = {
  children: Children;
  [x: string]: any;
};

/* eslint-disable react/jsx-props-no-spreading */
function PrivateRoute(props: PrivateProps) {
  const auth = useAuth();
  const { children, ...rest } = props;

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
export class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { collections: null };
  }

  componentDidMount() {}

  selectThing = (type: string, thing: Collection | Item): void => {
    console.log(`you selected the ${type} thing`);
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
            render={({ match }) => (
              <div>
                <CurateWrapper
                  etebaseInstance={this.props.etebaseInstance}
                  selectedThing={this.selectThing}
                  match={match}
                />
              </div>
            )}
          />
          <Route
            path="/curate/"
            render={() => (
              <CurateWrapper
                etebaseInstance={this.props.etebaseInstance}
                selectedThing={this.selectThing}
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
