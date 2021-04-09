import React, { Component, ChangeEvent, ReactNode } from "react";

import { DominateEtebase } from "@/etebase";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { Home } from "./Home.tsx";
import { Curate } from "./Curate.tsx";

export class UserInterface extends Component {
  state: {
    collections?: any;
    loading: boolean;
    etebase?: DominateEtebase;
  };

  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  selectThing = (type, thing) => {
    console.log(`you selected the ${type} ${thing} thing`);
  };

  componentDidMount() {
    console.log("Did mount!");
    const etebase = new DominateEtebase();
    void etebase.login("craig", "12345").then(async () => {
      this.setState({ etebase }); // Only when logged in
    });
  }

  render = (): ReactNode => (
    <Router>
      <h1>{this.state.loading.toString()}</h1>

      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/annotate">ANNOTATE</Link>
            </li>
            <li>
              <Link to="/curate">Curate</Link>
            </li>
            <li>
              <Link to="/curate/fsgdhfy">Curate blah blah</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/annotate">
            <div>TODO</div>
          </Route>
          <Route
            path="/curate/:id"
            render={({ match }: any) => (
              <Curate
                etebaseInstance={this.state.etebase}
                selectedThing={this.selectThing}
                match={match}
              />
            )}
          />

          <Route path="/curate">
            <Curate
              etebaseInstance={this.state.etebase}
              selectedThing={this.selectThing}
            />
          </Route>
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
