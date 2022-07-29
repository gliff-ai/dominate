import { useState } from "react";

import {
  AdvancedDialog,
  theme,
  Typography,
  MuiCard,
  Button
} from "@gliff-ai/style";
import { useNavigate } from "react-router-dom";

interface Props {
  recoveryKey: string[] | null;
}

export const RecoveryKeyDialog = ({ recoveryKey }: Props): JSX.Element => {
  const [forceClose, setForceClose] = useState(false);
  const navigate = useNavigate();

  function onClose() {
    navigate("/signin");
  }

  return (
    <AdvancedDialog
      open={!!recoveryKey && !forceClose}
      onClose={() => onClose()}
      maxWidth="md"
      title="Recovery Key"
    >
      <MuiCard
        sx={{
          width: "100%",
          height: "67px",
          border: "4px solid white",
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            padding: "19px 0",
            backgroundColor: "#fff",
          }}
        >
          {recoveryKey?.join(" ")}
        </Typography>
      </MuiCard>

      <Typography
        sx={{
          marginBottom: "44px",
          marginTop: "13px",
          color: theme.palette.text.primary,
          fontSize: 21,
          fontWeight: 700,
          width: "100%",
          textAlign: "center",
        }}
      >
        This is YOUR randomly generated recovery key
      </Typography>
      <Typography
        sx={{
          marginBottom: "44px",
          marginTop: "13px",
          color: "#000",
          fontSize: "21px",
          textAlign: "center",
          width: "100%",
          "& em": {
            fontWeight: "bold",
            textTransform: "uppercase",
            fontStyle: "normal",
          },
        }}
      >
        Please keep your recovery key stored in a safe place as this is the
        <em> only</em> time you will be shown. We <em>do not</em> store your
        recovery key, if you lose this we will be unable to recover your data
        attached to the account.
        <br />
        <br />
        <br />
        <Button
          onClick={() => {
            setForceClose(true);
            onClose();
          }}
          type="button"
          color="primary"
          variant="contained"
          sx={{ textAlign: "center" }}
          text="Ok"
        />
      </Typography>
    </AdvancedDialog>
  );
};
