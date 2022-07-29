import { CircularProgress } from "@mui/material";
import { Button, Box } from "@gliff-ai/style";
import { ReactElement } from "react";


  const submitDiv = {
    width: "fit-content",
    marginRight: "auto",
    marginLeft: "auto",
    "& > button": {
    marginBottom: "20px !important",
    marginTop: "20px !important",
    width: "169px",
    }
  }

interface Props {
  loading: boolean;
  disabled?: boolean;
  value: string;
}


function SubmitButton(props: Props): ReactElement {
   
const text = (props.loading ? (
          <CircularProgress size="1.5rem" color="inherit" />
        ) : (
          props.value
        ))

  return (
    <Box sx={{...submitDiv}}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={props.disabled}
        text={text}
      />
    </Box>
  );
}

SubmitButton.defaultProps = {
  disabled: false,
};

export { SubmitButton, Props as SubmitButtonProps };
