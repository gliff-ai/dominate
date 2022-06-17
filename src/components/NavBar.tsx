import { ReactElement, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SVG from "react-inlinesvg";
import {
  HtmlTooltip,
  MuiIconbutton,
  AppBar,
  Avatar,
  Button,
  Grid,
  Menu,
  MenuItem,
  theme,
  Toolbar,
  Typography,
} from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";

import { useAuth } from "@/hooks/use-auth";
import { ProductsNavbar, ProductNavbarData } from "@/components";

const documentButton = {
  marginLeft: "40px",
  "& img": {
    margin: "auto",
    borderRadius: "50%",
    height: "48px",
    backgroundColor: "#FAFAFA",
  },
  ".documentHover:hover": {
    backgroundColor: "#02FFAD",
  },
};
const svgMedium = {
  marginLeft: "-1px",
};
const menuItem = {
  opacity: "1",
  "&:hover": {
    background: theme.palette.primary.main,
  },
  "& a": {
    color: theme.palette.text.primary,
    textDecoration: "none",
    fontSize: "1rem",
    display: "inline-flex",
  },
  "& svg": {
    marginLeft: "-1px",
    marginRight: "12px",
  },
};
const appBar = {
  backgroundColor: `${theme.palette.secondary.light} !important`,
  height: "90px",
  paddingTop: "9px",
  justifyContent: "space-between",
};
const logo = {
  marginBottom: "5px",
  marginTop: "7px",
  marginRight: "200px",
};
const avatarUser = {
  width: "40px !important",
  height: "40px !important",
  backgroundColor: `${theme.palette.text.secondary} !important`,
  "&:hover": {
    backgroundColor: `${theme.palette.text.secondary} !important`,
  },
};
const productSectionGrid = {
  paddingTop: "0px",
  marginLeft: "30px",
};
const productSectionDiv = {
  ".productNavbarData": {
    display: "flex",
  },
};
const navGrid = {
  height: "90px",
  ".navLinks": {
    height: "100%",
    alignItems: "center",
    display: "flex",
  },
  ".productLocation": {
    border: "1px solid",
    borderColor: "#DADDE9",
    borderRadius: "9px",
    height: "42px",
    verticalAlign: "middle",
    fontFamily: "Roboto",
    fontWeight: "400",
    fontSize: "0.875rem",
    lineHeight: "1.75",
    display: "flex",
    paddingLeft: "10px",
    paddingRight: "10px",
    backgroundColor: "#FAFAFA",
  },
  ".productLocationImage": {
    margin: "auto",
    paddingRight: "10px",
    height: "40px",
    width: "40px",
  },
  ".productLocationText": {
    margin: "auto",
  },
};

const productLocationIcons = {
  manage: imgSrc("manage"),
  curate: imgSrc("curate"),
  audit: imgSrc("audit"),
  annotate: imgSrc("annotate"),
};

const getProductLocationIcon = (productLocation: string): string => {
  if (productLocation === "manage") return productLocationIcons.manage;
  if (productLocation === "curate") return productLocationIcons.curate;
  if (productLocation === "audit") return productLocationIcons.audit;
  if (productLocation === "annotate") return productLocationIcons.annotate;
  return "";
};

interface Props {
  productSection: JSX.Element | null;
  productNavbarData: ProductNavbarData;
}
export const NavBar = (props: Props): ReactElement | null => {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("");
  const [anchorElement, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!auth?.userProfile?.name) return;
    const initials = auth?.userProfile?.name
      .split(" ")
      .map((l) => l[0].toUpperCase())
      .join("");
    setUserInitials(initials);
  }, [auth]);

  const hasNavbar = (): boolean =>
    ![
      "/signin",
      "/signup",
      "/reset-password",
      "/request-recover",
      "/recover",
    ].includes(window.location.pathname);

  // If the URL begins with /annotate/ the productSection is rendered
  const isAnnotate = (): boolean =>
    window.location.pathname.startsWith("/annotate/");

  if (!auth) return null;
  if (!hasNavbar()) return null;

  // TODO: owners who are on free plan should still be able to upgrade
  const showBilling =
    auth?.userProfile?.id &&
    auth?.userProfile?.id === auth?.userProfile?.team.owner_id;

  const accountMenu = (
    <>
      <MuiIconbutton onClick={handleClick} aria-controls="menu" size="large">
        <HtmlTooltip
          title={<Typography>Account</Typography>}
          placement="bottom"
        >
          <Avatar variant="circular" sx={avatarUser}>
            {userInitials}
          </Avatar>
        </HtmlTooltip>
      </MuiIconbutton>
      <Menu
        anchorEl={anchorElement}
        keepMounted
        open={Boolean(anchorElement)}
        onClose={handleClose}
        id="menu"
        style={{ marginTop: "60px !important", marginLeft: "80px" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem sx={{ ...menuItem }}>
          <Link to="/account" onClick={() => setAnchorEl(null)}>
            <SVG src={imgSrc("account-settings")} width="22px" height="100%" />
            Account Settings
          </Link>
        </MenuItem>
        {showBilling ? (
          <MenuItem sx={{ ...menuItem }}>
            <Link to="/billing" onClick={() => setAnchorEl(null)}>
              <SVG
                src={imgSrc("account-settings")}
                width="22px"
                height="100%"
              />
              Billing
            </Link>
          </MenuItem>
        ) : null}
        <MenuItem
          sx={{ ...menuItem }}
          onClick={() =>
            auth.signout().then(() => {
              navigate("signin");
              setAnchorEl(null);
            })
          }
        >
          <SVG src={imgSrc("log-out")} width="22px" height="100%" />
          Log out
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <AppBar position="sticky" sx={appBar} elevation={0}>
      <Toolbar>
        <Grid
          sx={productSectionDiv}
          container
          direction="row"
          justifyContent="space-between"
        >
          <Grid sx={logo}>
            <img
              src={imgSrc("gliff-web-master-black")}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
          <div className="productNavbarData">
            <ProductsNavbar productNavbarData={props.productNavbarData} />
            {isAnnotate() ? (
              <Grid sx={productSectionGrid}>{props.productSection}</Grid>
            ) : null}
          </div>
          <Grid sx={navGrid}>
            <nav className="navLinks">
              <div className="productLocation">
                <img
                  className="productLocationImage"
                  src={getProductLocationIcon(
                    props.productNavbarData.productLocation.toLowerCase()
                  )}
                  alt={props.productNavbarData.productLocation}
                />
                <p className="productLocationText">
                  {props.productNavbarData.productLocation}
                </p>
              </div>
              <Button
                sx={documentButton}
                onClick={() => window.open("https://docs.gliff.app/", "_blank")}
              >
                <img
                  className="documentHover"
                  src={imgSrc("document")}
                  alt="help-center"
                />
              </Button>
              {auth.user ? (
                <>{accountMenu}</>
              ) : (
                <Typography>
                  <Link to="/signin">Sign In</Link>
                  &nbsp;
                  <Link to="/signup">Sign Up</Link>
                </Typography>
              )}
            </nav>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
