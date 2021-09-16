import { ReactElement, useEffect, useState } from "react";
import { makeStyles, Popover, TooltipProps } from "@material-ui/core";
import { BaseIconButton, BasePopover, theme } from "@gliff-ai/style";

import { useTrustedService } from "@/hooks/use-trustedService";
import { TrustedServiceClass } from "@/services/trustedServices";
import { imgSrc } from "@/imgSrc";

interface Props {
  collectionUid: string;
  imageUid: string;
  enabled?: boolean;
  tooltipPlacement?: TooltipProps["placement"];
}

export const TSButtonToolbar = (props: Props): ReactElement | null => {
  const trustedService = useTrustedService();
  const [elements, setElements] = useState<TrustedServiceClass[] | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);

  const getPlacement = (): string | null => {
    const path = window.location.href;
    for (const placement of ["annotate", "curate"]) {
      if (path.includes(placement)) {
        return placement;
      }
    }
    return null;
  };

  useEffect(() => {
    const currPlacement = getPlacement();
    if (!trustedService?.ready || !currPlacement || !trustedService?.uiElements)
      return;
    // Select ui elements for the active product
    setElements(
      trustedService?.uiElements.filter(({ placement }) =>
        placement.includes(currPlacement)
      )
    );
  }, [trustedService?.ready]);

  useEffect(() => {
    if (!elements) return;
    setEnabled(Boolean(elements.length > 0 && props.enabled));
  }, [elements, props.enabled]);

  return (
    <BasePopover
      tooltip={{
        name: "Trusted Services",
        icon: imgSrc("trusted-services"),
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      enabled={enabled}
      tooltipPlacement={props.tooltipPlacement}
    >
      {elements ? (
        <Card color={theme.palette.primary.light}>
          {elements.map((ts) => (
            <BaseIconButton
              key={`ts-${ts.tooltip}`}
              tooltip={{
                name: ts.tooltip,
                icon: imgSrc(ts.icon),
              }}
              onClick={() => ts.onClick(props.collectionUid, props.imageUid)}
              tooltipPlacement={props.tooltipPlacement}
            />
          ))}
        </Card>
      ) : null}
    </BasePopover>
  );
};

TSButtonToolbar.defaultProps = {
  enabled: true,
  tooltipPlacement: "right",
};
