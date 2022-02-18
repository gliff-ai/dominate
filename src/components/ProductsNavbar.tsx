import { ReactElement, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { theme, IconButton, icons } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";

const useStyles = makeStyles({});

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

  const { buttonBack, teamName, projectName, imageName, buttonForward } =
    productNavbarData;
  return (
    <>
      {buttonBack}
      <p>
        {teamName}
        {projectName !== "" && `—${projectName}`}
        {imageName !== "" && `—${imageName}`}
      </p>
      {buttonForward}
    </>
  );
}

export { ProductNavbarData };
