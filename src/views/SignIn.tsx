import React, { ReactElement } from "react";
import {useAuth} from "@/hooks/use-auth";

export const SignIn = (): ReactElement => {
  const auth = useAuth(); // TODO type

  return <div>
  <button type="button" onClick={() => auth.signin("craig", "12345")}>Sign In</button>

  </div>;
};
