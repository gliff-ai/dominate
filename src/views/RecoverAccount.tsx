import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRecoverySession } from "@/services/user";
import { DominateEtebase } from "@/etebase";

const query = new URLSearchParams(window.location.search);

interface Props {
  etebaseInstance: DominateEtebase;
}

export const RecoverAccount = (props: Props): JSX.Element => {
  const { etebaseInstance } = props;
  const navigate = useNavigate();
  const [recoverySession, setRecoverySession] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recover, setRecover] = useState({
    newPassword: "",
    recoveryKey: "",
  });

  useEffect(() => {
    if (query.get("uid")) {
      void getRecoverySession(query.get("uid")).then(({ recovery_key }) => {
        setRecoverySession(recovery_key);
      });
    }
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRecover({
      ...recover,
      [name]: value,
    });
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Reset any errors
    setRecoveryError("");

    // Convert their input to the format we expect
    const restoredSession = await etebaseInstance.restoreSession(
      recoverySession,
      recover.recoveryKey,
      recover.newPassword
    );

    if (restoredSession) {
      setLoading(false);
      navigate("/signin");
    } else {
      setRecoveryError("Couldn't recover account with those details");
    }
  };

  if (!recoverySession) {
    return <h1>Invalid Recovery Token</h1>;
  }

  return (
    <div>
      <h1>Recover account here!</h1>
      <form onSubmit={onSubmitForm}>
        <label htmlFor="recoveryKey">
          Recovery Key:
          <input
            required
            type="text"
            name="recoveryKey"
            value={recover.recoveryKey}
            onChange={handleChange}
          />
        </label>
        <label htmlFor="newPassword">
          New Password:
          <input
            required
            type="password"
            name="newPassword"
            value={recover.newPassword}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Reset</button>

        <div style={{ color: "red", fontSize: 12 }}>{recoveryError}</div>
      </form>
    </div>
  );
};
