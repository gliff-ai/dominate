import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { MessageAlert, SubmitButton } from "@/components";
import { apiRequest } from "@/api";
import { useMountEffect } from "@/hooks/use-mountEffect";

export const VerifyEmail = (): JSX.Element => {
  const navigate = useNavigate();
  const { uid = "" } = useParams(); // uid of user from URL
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const onSubmitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/manage/projects");
  };

  useMountEffect(() => {
    const onLoadForm = async (): Promise<void> => {
      try {
        setLoading(true);

        // Reset any errors
        setRequestError("");

        await apiRequest<boolean>(`/user/verify_email/${uid}`, "GET");

        setLoading(false);
      } catch (e) {
        // The user CAN get here if they're already verified! Show the error and then redirect
        setRequestError("Account verification failed");
        setTimeout(() => navigate("/"), 5000);
      }
    };

    void onLoadForm();
  });

  if (!uid) {
    return <></>;
  }

  return (
    <>
      <form onSubmit={onSubmitForm}>
        {!loading ? (
          <Typography variant="h6" align="center" gutterBottom>
            Thank you for verifying your email address.
          </Typography>
        ) : (
          <Typography variant="body1" align="center" gutterBottom>
            Your gliff.ai account is being verified...
          </Typography>
        )}

        <SubmitButton
          loading={loading}
          disabled={loading}
          value="Take me to the platform"
        />

        <MessageAlert severity="error" message={requestError} />
      </form>
    </>
  );
};
