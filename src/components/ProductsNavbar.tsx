import { ReactElement, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { Button, ButtonGroup } from "@mui/material";
import { theme, IconButton, icons } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";

const useStyles = makeStyles({
  // buttonGroup: {
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   height: "100%",
  // },
});

interface ProductNavbarData {
  teamName: string; // fetched in MANAGE
  projectName: string; // fetched in CURATE or AUDIT
  imageName: string; // fetched in ANNOTATE or AUDIT
  buttonBack: ReactElement | null;
  buttonForward: ReactElement | null;
}

interface Props {
  productNavbarData: ProductNavbarData;
}

export function ProductsNavbar({
  productNavbarData,
}: Props): ReactElement | null {
  const classes = useStyles();
  const auth = useAuth();
  const location = useLocation();
  const [state, setState] = useState(() => {
    console.log("hello world");
    return;
  });

  const { buttonBack, teamName, projectName, imageName, buttonForward } =
    productNavbarData;
  return (
    // FIXME move CSS to STYLE
    <ButtonGroup
      orientation="horizontal"
      variant="text"
      aria-label="outlined  button group"
      style={{
        backgroundColor: "white",
        color: "white",
        padding: "1px",
      }}
    >
      <Button style={{ backgroundColor: "white", borderColor: "#dadde9" }}>
        {buttonBack}
      </Button>
      <Button style={{ backgroundColor: "white", borderColor: "#dadde9" }}>
        {teamName} ^-^ {projectName !== "" && `—${projectName}`}
        {imageName !== "" && `—${imageName}`}
      </Button>
      <Button style={{ backgroundColor: "white", borderColor: "#dadde9" }}>
        {buttonForward}
      </Button>
    </ButtonGroup>
  );
}

export { ProductNavbarData };
