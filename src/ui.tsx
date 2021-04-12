import React, { Component, ChangeEvent, ReactNode } from "react";

import { DominateEtebase } from "@/etebase";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { Home } from "./Home.tsx";
import { Curate } from "./Curate.tsx";

import { Navbar } from "@/NavBar";
import { SignIn } from "@/views/SignIn";

interface Props {
  etebaseInstance: DominateEtebase;
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

  componentDidMount() {
  }

  render = (): ReactNode => (
    <Router>
      <div>
        <Navbar />

        <br/><br/><br/>

        <Switch>
          <Route path="/signin">
            <SignIn />
          </Route>
          <Route path="/annotate">
            <div>TODO</div>
          </Route>
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
