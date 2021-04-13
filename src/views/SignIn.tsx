import React, { ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";

export const SignIn = (): ReactElement => {
  const auth = useAuth();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({
    name: "",
    password: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setLogin((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <div>
      <form>
        <label>
          Name:
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={login.name}
            id={"name"}
          />
        </label>
      </form>

      <form>
        <label>
          Password:
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={login.password}
            id={"password"}
          />
        </label>
      </form>

      <button
        type="button"
        onClick={() => {
          setLoading(true);
          void auth.signin(login.name, login.password).then(() => {
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
