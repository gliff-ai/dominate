import { Typography, AdvancedDialog, Box, Button } from "@gliff-ai/style";

export function ConfirmationDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  heading: string;
  message: string;
  okCallback: () => void;
}) {
  return (
    <AdvancedDialog open={props.open} title={props.heading}>
      <Typography style={{ margin: "10px" }}>{props.message}</Typography>
      <Box>
        <Button
          onClick={() => {
            props.setOpen(false);
            void props.okCallback();
          }}
          color="primary"
          variant="contained"
          text="OK"
        />
        <Button
          onClick={() => {
            props.setOpen(false);
          }}
          color="primary"
          variant="contained"
          text="Cancel"
        />
      </Box>
    </AdvancedDialog>
  );
}

export function MessageDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  heading: string;
  message: string;
  okCallback?: () => void;
}) {
  return (
    <AdvancedDialog open={props.open} title={props.heading}>
      <Typography style={{ margin: "10px" }}>{props.message}</Typography>
      <Box>
        <Button
          onClick={() => {
            props.setOpen(false);
            if (props.okCallback) {
              void props.okCallback();
            }
          }}
          color="primary"
          text="OK"
        />
      </Box>
    </AdvancedDialog>
  );
}

MessageDialog.defaultProps = { okCallback: null };
