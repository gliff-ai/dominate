/* eslint-disable react/jsx-curly-newline */
import { Component, ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Collection, DominateEtebase, Item } from "@/etebase";
import { SignIn } from "@/views/SignIn";
import { SignUp } from "@/views/signup/SignUp";
import { Navbar } from "@/NavBar";
import { ManageWrapper } from "@/ManageWrapper";
import { AnnotateWrapper } from "@/AnnotateWrapper";
import { Home } from "./Home";
import { CurateWrapper } from "./CurateWrapper";

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
          <Route
            path="curate/:id"
            element={
              <CurateWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route
            path="curate/"
            element={
              <CurateWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route
            path="/annotate/:colId/:imageId"
            element={
              <AnnotateWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
          <Route
            path="manage/*"
            element={
              <ManageWrapper etebaseInstance={this.props.etebaseInstance} />
            }
          />
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
