import { ReactElement, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { theme } from "@/theme";
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
  annotate = "annotate",
}

function ProductIcons(): ReactElement {
  const classes = useStyles();
  const [activeProduct, setActiveProduct] = useState(Product.manage);
  const products: string[] = ["manage", "curate", "annotate"];

  function updateActiveProduct() {
    const pathName = window.location.pathname;
    if (pathName.includes(activeProduct)) return;

    for (const product of products) {
      if (pathName.includes(product)) {
        setActiveProduct(Product[product]);
        break;
      }
    }
  }

  const isActive = (product: Product): boolean => product === activeProduct;

  function getProductIcon(tool: string, status: Status): ReactElement | null {
    const key = `${tool}-${status}`;

    switch (status) {
      case Status.active:
        return (
          <BaseProductIcon
            buttonKey={key}
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
            buttonKey={key}
            tool={tool}
            extraStyleSvg={classes.accessibleSvg}
            extraStyleName={classes.accessibleName}
            extraStyleTrailSvg={classes.accessibleTrailSvg}
          />
        );
      case Status.disabled:
        return (
          <BaseProductIcon
            buttonKey={key}
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

  useEffect(() => {
    updateActiveProduct();
  }, [window.location.pathname]);

  let otherStatus = Status.accessible;
  return (
    <>
      {products.map((product) => {
        if (isActive(Product[product])) {
          otherStatus = Status.disabled;
          return getProductIcon(product, Status.active);
        }
        return getProductIcon(product, otherStatus);
      })}
    </>
  );
}

export { ProductIcons, Status };
