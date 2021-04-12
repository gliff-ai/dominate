import * as React from "react";
import * as ReactDOM from "react-dom";

import { ProvideAuth } from "@/hooks/use-auth";
import { UserInterface } from "@/ui";
import { DominateEtebase } from "@/etebase";

const etebaseInstance = new DominateEtebase();

ReactDOM.render(
  <ProvideAuth etebaseInstance={etebaseInstance}>
    <UserInterface etebaseInstance={etebaseInstance} />
  </ProvideAuth>,
  document.getElementById("react-container")
);
