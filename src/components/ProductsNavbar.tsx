import { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import { Grid, Button, ButtonGroup } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";

const buttonBorder = {
  backgroundColor: "white !important",
  borderColor: "#dadde9 !important",
  cursor: "default",
  paddingLeft: "30px",
  paddingRight: "30px",
  textAlign: "center",
  textTransform: "none",
  fontFamily: "Roboto",
  fontWeight: "400",
  fontSize: "16px",
  color: "#2B2F3A",
};
const buttonGroup = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "42px",
};
const productSectionGrid = {
  display: "flex",
  alignItems: "center",
};

interface ProductNavbarData {
  teamName: string; // fetched in MANAGE
  projectName: string; // fetched in CURATE or AUDIT
  imageName: string; // fetched in ANNOTATE or AUDIT
  buttonBack: ReactElement | null;
  buttonForward: ReactElement | null;
  productLocation: string;
}

interface Props {
  productNavbarData: ProductNavbarData;
}

export function ProductsNavbar({
  productNavbarData,
}: Props): ReactElement | null {
  const auth = useAuth();
  const location = useLocation();
  const { buttonBack, teamName, projectName, imageName, buttonForward } =
    productNavbarData;

  return (
    // FIXME move CSS to STYLE
    <Grid sx={productSectionGrid}>
      <ButtonGroup
        sx={buttonGroup}
        orientation="horizontal"
        variant="text"
        aria-label="outlined primary button group"
        style={{
          backgroundColor: "white",
          color: "white",
          padding: "1px",
        }}
      >
        <div style={{ borderRight: "1px solid #dadde9" }}>{buttonBack}</div>
        <Button sx={buttonBorder}>
          {teamName} {projectName !== "" && `— ${projectName}`}
          {imageName !== "" && ` — ${imageName}`}
        </Button>
        <div style={{ borderLeft: "1px solid #dadde9" }}>{buttonForward}</div>
      </ButtonGroup>
    </Grid>
  );
}

export { ProductNavbarData };
