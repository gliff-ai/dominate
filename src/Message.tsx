import { ReactElement } from "react";
import { Alert } from "@material-ui/lab";

interface Props {
  message: string;
  severity: "info" | "warning" | "error" | "success";
}

function Message({ message, severity }: Props): ReactElement {
  return message && <Alert severity={severity}>{message}</Alert>;
}

export { Message };
