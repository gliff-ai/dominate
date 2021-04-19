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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setLogin((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const onFormSubmit = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    e.preventDefault();
    setLoading(true);
    auth
      .signin(login.name, login.password)
      .then(() => {
        setLoading(false);
        history.push("/");
      })
      .catch((err) => {
        alert(err);
        setLoading(false);
        setLogin({ name: "", password: "" });
      });
  };

  return (
    // TODO: Click enter to also login
    <div>
      <form onSubmit={onFormSubmit}>
        <label htmlFor="name">
          Name:
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={login.name}
            id="name"
          />
        </label>

        <label htmlFor="password">
          Password:
          <input
            type="text"
            name="password"
            onChange={handleChange}
            value={login.password}
            id="password"
          />
        </label>

        <button type="submit">{loading ? "Loading..." : "Sign In"}</button>
      </form>
    </div>
  );
};
