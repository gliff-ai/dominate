import { ReactElement, useEffect, useState } from "react";
import { TooltipProps, Card } from "@material-ui/core";
import { BaseIconButton, BasePopover, theme } from "@gliff-ai/style";
import { MessageSnackbar } from "@/components";

import { useTrustedService } from "@/hooks/use-trustedService";
import { TrustedServiceClass } from "@/services/trustedServices";
import { imgSrc } from "@/imgSrc";

interface Props {
  collectionUid: string;
  imageUid: string;
  enabled?: boolean;
  tooltipPlacement?: TooltipProps["placement"];
  callback?: (() => void) | null;
}

export const TSButtonToolbar = (props: Props): ReactElement | null => {
  const trustedService = useTrustedService();
  const [elements, setElements] = useState<TrustedServiceClass[] | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

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
    if (
      trustedService === null ||
      !currPlacement ||
      !trustedService?.uiElements
    )
      return;

    // Select ui elements for the active product
    const newElements = trustedService?.uiElements.filter(({ placement }) =>
      placement.includes(currPlacement)
    );

    if (newElements.length !== 0) {
      setElements(newElements);
    }
  }, [trustedService, props.imageUid]);

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
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      enabled={enabled}
      tooltipPlacement={props.tooltipPlacement}
    >
      {elements ? (
        <>
          <Card color={theme.palette.primary.light}>
            {elements.map((ts) => (
              <BaseIconButton
                key={`ts-${ts.tooltip}`}
                tooltip={{
                  name: ts.tooltip,
                  icon: imgSrc(ts.icon),
                }}
                onClick={() => {
                  ts.onClick(props.collectionUid, props.imageUid)
                    .then((response) => {
                      if (response.status === "failure" && response?.message) {
                        setMessage(response.message);
                        setOpen(true);
                      } else if (props.callback) {
                        props.callback();
                      }
                    })
                    .catch((e) => console.error(e));
                }}
                tooltipPlacement={props.tooltipPlacement}
              />
            ))}
          </Card>
          <MessageSnackbar
            open={open}
            handleClose={() => setOpen(false)}
            messageText={message}
          />
        </>
      ) : null}
    </BasePopover>
  );
};

TSButtonToolbar.defaultProps = {
  enabled: true,
  tooltipPlacement: "right",
  callback: null,
};
