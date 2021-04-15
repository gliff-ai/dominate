import React, { ReactElement, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "react-router-dom";

export const SignUp = (): ReactElement => {
  const auth = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [signUp, setSignUp] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setSignUp((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <div>
      <form>
        <label htmlFor="name">
          Name:
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={signUp.name}
            id="name"
            placeholder="Enter email address"
          />
        </label>
      </form>

      <form>
        <label htmlFor="password">
          Password:
          <input
            type="text"
            name="name"
            required
            onChange={handleChange}
            value={signUp.password}
            id="password"
          />
        </label>
      </form>

      <form>
        <label htmlFor="confirmPassword">
          Confirm Password:
          <input
            type="text"
            name="name"
            required
            onChange={handleChange}
            value={signUp.confirmPassword}
            id="confirmPassword"
          />
        </label>
      </form>

      <button
        type="button"
        onClick={() => {
          setLoading(true);
          auth
            .signup(signUp.name, signUp.password)
            .then(() => {
              setLoading(false);
              history.push("/");
            })
            .catch((err) => {
              console.log(err);
            });
        }}
        disabled={signUp.confirmPassword.length < 1}
      >
        {loading ? "Loading..." : "Sign up"}
      </button>
    </div>
  );
};
