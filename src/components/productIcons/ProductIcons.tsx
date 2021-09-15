import { ReactElement, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { theme } from "@gliff-ai/style";
import { BaseProductIcon } from "./BaseProductIcon";
import { useAuth } from "@/hooks/use-auth";

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

function ProductIcons(): ReactElement | null {
  const classes = useStyles();
  const auth = useAuth();
  const location = useLocation();
  const [activeProduct, setActiveProduct] = useState(Product.manage);
  const [products, setProducts] = useState<string[]>([
    "manage",
    "curate",
    "annotate",
  ]);

  // only display the AUDIT icon if on a paid tier:
  useEffect(() => {
    const tier = auth?.userProfile?.team.tier;
    if (tier && tier.id > 1)
      setProducts(["manage", "curate", "annotate", "audit"]);
  }, [auth]);

  const isActive = (product: Product): boolean => product === activeProduct;

  const getCustomUrlPath = (
    tool: string,
    status: Status
  ): string | undefined => {
    // When navigating back to curate from annotate using the navbar
    // the collectionUid in the annotate url is used to set the url path for curate
    if (["curate", "audit"].includes(tool) && status === Status.accessible) {
      const galleryUid = window.location.pathname.split("/").reverse()[
        activeProduct === Product.annotate ? 1 : 0
      ];
      return `/${tool}/${galleryUid}`;
    }
    return undefined;
  };

  function getProductIcon(tool: string, status: Status): ReactElement | null {
    const key = `${tool}-${status}`;
    const tier = auth?.userProfile?.team.tier;
    const auditEnabled = tier && tier.id > 1;

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
            auditEnabled={auditEnabled}
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
            auditEnabled={auditEnabled}
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
            auditEnabled={auditEnabled}
          />
        );
      default:
        return null;
    }
  }

  const getProductIcons = () => {
    if (activeProduct === Product.other) {
      // If not on any product, only manage is accessible
      return products.map((product) =>
        getProductIcon(
          product,
          product === "manage" ? Status.accessible : Status.disabled
        )
      );
    }

    let curateStatus;
    let auditStatus;
    if (activeProduct === Product.manage) {
      curateStatus = Status.disabled;
      auditStatus = Status.disabled;
    } else if (activeProduct === Product.annotate) {
      curateStatus = Status.accessible;
      auditStatus = Status.accessible;
    } else {
      curateStatus =
        activeProduct === Product.curate ? Status.active : Status.accessible;
      auditStatus =
        activeProduct === Product.audit ? Status.active : Status.accessible;
    }

    const icons = [
      getProductIcon(
        "manage",
        activeProduct === Product.manage ? Status.active : Status.accessible
      ),
      getProductIcon("curate", curateStatus),
      getProductIcon(
        "annotate",
        activeProduct === Product.annotate ? Status.active : Status.disabled
      ),
    ];
    const tier = auth?.userProfile?.team.tier;
    if (tier && tier.id > 1) icons.push(getProductIcon("audit", auditStatus));

    return icons;
  };

  useEffect(() => {
    function updateActiveProduct() {
      // reads the address bar, sets activeProduct accordingly
      const pathName = location.pathname;
      if (pathName.includes(activeProduct)) return;

      for (const product of products) {
        if (pathName.includes(product)) {
          setActiveProduct(Product[product]);
          return;
        }
      }
      setActiveProduct(Product.other);
    }

    updateActiveProduct();
  }, [location.pathname, products, activeProduct]);

  if (!auth) return null;

  return <>{getProductIcons()}</>;
}

export { ProductIcons, Status, BaseProductIcon };
