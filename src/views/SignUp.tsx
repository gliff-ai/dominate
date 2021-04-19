import React, { ReactElement, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "react-router-dom";

export const SignUp = (): ReactElement => {
  const auth = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [paswordError, setPasswordError] = useState("");

  const [signUp, setSignUp] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    let nameErrorMessage = "";
    let passwordErrorMessage = "";

    if (signUp.password !== signUp.confirmPassword) {
      passwordErrorMessage = "Passwords do not match";
    }
    if (passwordErrorMessage) {
      setPasswordError(passwordErrorMessage);
      return false;
    }
    if (!signUp.name.includes("@")) {
      nameErrorMessage = "Invalid email";
    }
    if (nameErrorMessage) {
      setNameError(nameErrorMessage);
      return false;
    }
    return true;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setSignUp({
      ...signUp,
      [id]: value,
    });
  };

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = validate();

    if (isValid) {
      setLoading(true);
      auth
        .signup(signUp.name, signUp.password)
        .then(() => {
          setLoading(false);
          history.push("/");
        })
        .catch((err) => {
          alert(err);
          setLoading(false);
          setSignUp({ name: "", password: "", confirmPassword: "" });
          setNameError("");
          setPasswordError("");
        });
    }
  };

  return (
    <div>
      <form onSubmit={onSubmitForm}>
        <label htmlFor="name">
          Name:
          <input
            required
            name="name"
            onChange={handleChange}
            value={signUp.name}
            id="name"
            placeholder="Enter email address"
          />
        </label>
        <div style={{ color: "red", fontSize: 12 }}>{nameError}</div>
      </form>

      <form onSubmit={onSubmitForm}>
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

      <form onSubmit={onSubmitForm}>
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
          <div style={{ color: "red", fontSize: 12 }}>{paswordError}</div>
        </label>
      </form>

      <form onSubmit={onSubmitForm}>
        <button type="submit" disabled={signUp.confirmPassword.length < 1}>
          {loading ? "Loading..." : "Sign up"}
        </button>
      </form>
    </div>
  );
};
