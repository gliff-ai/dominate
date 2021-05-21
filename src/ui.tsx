/* eslint-disable react/jsx-curly-newline */
import React, { Component, ReactNode } from "react";
import { Collection, DominateEtebase, Item } from "@/etebase";
import { useAuth } from "@/hooks/use-auth";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/signup/SignUp";
import { Navbar } from "@/NavBar";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Home } from "./Home";
import { ManageWrapper } from "@/ManageWrapper";
// import { CurateWrapper } from "./Curate";
// import { ManageWrapper } from "@/ManageWrapper";
//
// type Children =
//   | ((props: RouteChildrenProps<any>) => React.ReactNode)
//   | React.ReactNode;

interface Props {
  etebaseInstance: DominateEtebase;
  // children?: Children;
}

interface State {
  collections?: Collection[];
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
// type PrivateProps = {
//   children: Children;
//   [x: string]: any;
// };

/* eslint-disable react/jsx-props-no-spreading */
// function PrivateRoute(props: PrivateProps) {
//   const auth = useAuth();
//   const { children, ...rest } = props;
//
//   return (
//     <Route
//       {...rest}
//       render={({ location }) =>
//         auth.user ? (
//           children
//         ) : (
//           <Redirect
//             to={{
//               pathname: "/signin",
//               state: { from: location },
//             }}
//           />
//         )
//       }
//     />
//   );
// }
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
    <BrowserRouter>
      <div>
        <Navbar />

        <br />
        <br />
        <br />

        <Routes>
          <Route path="/signin">
            <SignIn />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/annotate">
            <div>TODO</div>
          </Route>

          <Route
            path="manage/*"
            element={
              <ManageWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />

          {/*<Route*/}
          {/*  path="/curate/:id" >*/}
          {/*    <div>*/}
          {/*      <CurateWrapper*/}
          {/*        etebaseInstance={this.props.etebaseInstance}*/}
          {/*        selectedThing={this.selectThing}*/}
          {/*      />*/}
          {/*    </div>*/}
          {/*</Route>*/}
          {/*<Route*/}
          {/*  path="/curate/"*/}
          {/*  render={() => (*/}
          {/*    <CurateWrapper*/}
          {/*      etebaseInstance={this.props.etebaseInstance}*/}
          {/*      selectedThing={this.selectThing}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
          <Route path="/">
            <Home />
          </Route>
        </Routes>
      </div>

      <footer>
        <div>
          {this.state.collections?.map((col) => JSON.stringify(col.getMeta()))}
        </div>
      </footer>
    </BrowserRouter>
  );
}
