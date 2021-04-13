import React, { ReactElement, useState } from "react";

export const SignUp = (): ReactElement => {
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
          console.log("hello");
        }}
      >
        Sign Up
      </button>
    </div>
  );
};
