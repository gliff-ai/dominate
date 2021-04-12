import React, { ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";

export const SignIn = (): ReactElement => {
  const auth = useAuth(); // TODO type
  const history = useHistory();

  const [loading, setLoading] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setLoading(true);
          auth.signin("craig", "12345").then(() => {
            setLoading(false);
            history.push("/");
          });
        }}
      >
        {loading ? "Loading..." : "Sign In"}
      </button>
    </div>
  );
};
