import { ReactElement, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { theme } from "@gliff-ai/style";
import { BaseProductIcon } from "./BaseProductIcon";

const useStyles = makeStyles({
  activeSvg: {
    fill: theme.palette.primary.main,
  },
  noHoverAvatar: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  activeName: {
    color: theme.palette.primary.main,
  },
  accessibleSvg: {
    fill: "#000000",
  },
  accessibleName: {
    color: "#000000",
  },
  disabledSvg: {
    fill: theme.palette.text.secondary,
  },
  disableName: {
    color: theme.palette.text.secondary,
  },
  accessibleTrailSvg: {
    fill: "#000000",
  },
});

enum Status {
  active = "active",
  accessible = "accessible",
  disabled = "disabled",
}

enum Product {
  manage = "manage",
  curate = "curate",
  audit = "audit",
  annotate = "annotate",
  other = "other",
}

function ProductIcons(): ReactElement {
  const classes = useStyles();
  const [activeProduct, setActiveProduct] = useState(Product.manage);
  const products: string[] = ["manage", "curate", "audit", "annotate"];

  function updateActiveProduct() {
    // reads the address bar, sets activeProduct accordingly
    const pathName = window.location.pathname;
    if (pathName.includes(activeProduct)) return;

    for (const product of products) {
      if (pathName.includes(product)) {
        setActiveProduct(Product[product]);
        return;
      }
    }
    setActiveProduct(Product.other);
  }

  const isActive = (product: Product): boolean => product === activeProduct;

  const getCustomUrlPath = (tool: string, status: Status): string | null => {
    // When navigating back to curate from annotate using the navbar
    // the collectionUid in the annotate url is used to set the url path for curate
    if (tool === "curate" && status === Status.accessible) {
      const galleryUid = window.location.pathname.split("/").reverse()[
        activeProduct === Product.annotate ? 1 : 0
      ];
      return `/curate/${galleryUid}`;
    }
    return null;
  };

  function getProductIcon(tool: string, status: Status): ReactElement | null {
    const key = `${tool}-${status}`;

    switch (status) {
      case Status.active:
        return (
          <BaseProductIcon
            key={key}
            tool={tool}
            linkDisabled
            extraStyleAvatar={classes.noHoverAvatar}
            extraStyleSvg={classes.activeSvg}
            extraStyleName={classes.activeName}
          />
        );
      case Status.accessible:
        return (
          <BaseProductIcon
            key={key}
            tool={tool}
            customUrlPath={getCustomUrlPath(tool, status)}
            extraStyleSvg={classes.accessibleSvg}
            extraStyleName={classes.accessibleName}
            extraStyleTrailSvg={classes.accessibleTrailSvg}
          />
        );
      case Status.disabled:
        return (
          <BaseProductIcon
            key={key}
            tool={tool}
            linkDisabled
            extraStyleAvatar={classes.noHoverAvatar}
            extraStyleSvg={classes.disabledSvg}
            extraStyleName={classes.disableName}
          />
        );
      default:
        return null;
    }
  }

  const getProductIcons = () => {
    if (activeProduct !== Product.other) {
      let otherStatus = Status.accessible; // Every button before the active one is accessible
      return products.map((product) => {
        if (isActive(Product[product])) {
          otherStatus = Status.disabled; // Every button after the active one is disabled
          return getProductIcon(product, Status.active);
        }
        return getProductIcon(product, otherStatus);
      });
    }
    return products.map((product) => {
      if (Product[product] === Product.manage) {
        return getProductIcon(product, Status.accessible); // If not on any product, only manage is accessible
      }
      return getProductIcon(product, Status.disabled);
    });
  };

  useEffect(() => {
    updateActiveProduct();
  }, [window.location.pathname]);

  return <>{getProductIcons()}</>;
}

export { ProductIcons, Status, BaseProductIcon };
