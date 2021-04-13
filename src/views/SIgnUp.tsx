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

  const handleChange = (e) => {
    console.log(signUp.name);
    const { id, value } = e.target;
    setSignUp((prevState) => ({
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
            value={signUp.name}
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
            value={signUp.password}
            id={"password"}
          />
        </label>
      </form>

      <form>
        <label>
          Confirm Password:
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={signUp.confirmPassword}
            id={"confirmPassword"}
          />
        </label>
      </form>

      <button
        type="button"
        onClick={() => {
          setLoading(true);
          void auth.signup(signUp.name, signUp.password).then(() => {
            setLoading(false);
            history.push("/");
          });
        }}
      >
        {loading ? "Loading..." : "Sign up"}
      </button>
    </div>
  );
};
