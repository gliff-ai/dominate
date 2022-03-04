import { ReactElement, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { Button, ButtonGroup, Grid } from "@mui/material";
import { theme, IconButton, icons } from "@gliff-ai/style";
import { useAuth } from "@/hooks/use-auth";
import { GalleryTile } from "@/store/interfaces";

const useStyles = makeStyles({
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  productSectionGrid: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  buttonBorder: {
    backgroundColor: "white !important",
    borderColor: "#dadde9 !important",
  },
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
  const { buttonBack, teamName, projectName, imageName, buttonForward } =
    productNavbarData;

  // const fetchImageItems = useStore(
  //   // doesn't actually fetch image items, fetches gallery collection content
  //   props,
  //   (storeInstance) => {
  //     // fetches images via DominateStore, and assigns them to imageItems state
  //     if (!auth?.user?.username) return;
  //     storeInstance
  //       .getImagesMeta(collectionUid, auth?.user.username)
  //       .then((items) => {
  //         const { tiles, galleryMeta } = items;
  //         setStateIfMounted(tiles, setCollectionContent, isMounted.current);
  //         console.log(items?.galleryMeta?.name);
  //       })
  //       .catch((err) => {
  //         logger.log(err);
  //       });
  //   }
  // );

  return (
    // FIXME move CSS to STYLE
    <Grid className={classes.productSectionGrid}>
      <ButtonGroup
        className={classes.buttonGroup}
        orientation="horizontal"
        variant="text"
        aria-label="outlined  button group"
        style={{
          backgroundColor: "white",
          color: "white",
          padding: "1px",
        }}
      >
        <Button className={classes.buttonBorder}>{buttonBack}</Button>
        <Button className={classes.buttonBorder}>
          {teamName} ^-^ {projectName !== "" && `—${projectName}`}
          {imageName !== "" && `—${imageName}`}
        </Button>
        <Button className={classes.buttonBorder}>{buttonForward}</Button>
      </ButtonGroup>
    </Grid>
  );
}

export { ProductNavbarData };
