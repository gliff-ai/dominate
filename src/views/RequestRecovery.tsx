import { ChangeEvent, FormEvent, useState } from "react";

import { apiRequest } from "@/api";

export const RequestRecoverAccount = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRecoveryEmail(event.target.value);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      setLoading(true);

      // Reset any errors
      setRecoveryError("");

      await apiRequest("/user/recover", "POST", {
        email: recoveryEmail,
      });

      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.error(e);

      setRecoveryError("Couldn't send email");
    }
  };

  const successBanner = success ? <div>Email sent</div> : "";

  return (
    <div>
      <h1>
        Enter your email address to request a recovery link. You will need your
        recovery key to compelete the process
      </h1>
      {successBanner}
      <form onSubmit={onSubmitForm}>
        <label htmlFor="recoveryEmail">
          Email:
          <input
            required
            type="email"
            name="recoveryEmail"
            value={recoveryEmail}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Request Recovery</button>

        <div style={{ color: "red", fontSize: 12 }}>{recoveryError}</div>
      </form>
    </div>
  );
};
