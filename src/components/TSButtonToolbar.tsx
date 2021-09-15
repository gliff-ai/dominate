import { ReactElement, useState, MouseEvent} from "react";
import { makeStyles, Popover, TooltipProps } from "@material-ui/core";
import { BaseIconButton } from "@gliff-ai/style";
import { useTrustedService } from "@/hooks/use-trustedService";
import { imgSrc } from "@/imgSrc";
import { TrustedServiceClass } from "@/services/trustedServices";

const useStyle = makeStyles(() => ({
  popoverPaper: {
    padding: "5px",
    maxWidth: "200px",
    height: "auto",
  },
}));

interface Props {
  placement: string;
  collectionUid: string;
  imageUid: string;
  enabled?: boolean;
  tooltipPlacement?: TooltipProps["placement"];
}

export const TSButtonToolbar = (props: Props): ReactElement | null => {
  const trustedService = useTrustedService();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const classes = useStyle();

  if (!trustedService || !trustedService.uiElements) return null;

  const handleClick =
    (isEnabled: boolean) =>
    (event: MouseEvent<HTMLButtonElement>): void => {
      if (!isEnabled) return;
      setAnchorEl(event.currentTarget);
    };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const selectedElements = (): TrustedServiceClass[] =>
    // Select ui elements for the active product
    (trustedService.uiElements as TrustedServiceClass[]).filter((ts) =>
      ts.placement.includes(props.placement)
    );

  if (trustedService.ready) {
    const isEnabled = Boolean(selectedElements().length > 0 && props.enabled);
    return (
      <>
        <BaseIconButton
          tooltip={{
            name: "Trusted Services",
            icon: imgSrc("annotate"),
          }} // TODO: replace icon!
          onClick={handleClick(isEnabled)}
          enabled={isEnabled}
          tooltipPlacement={props.tooltipPlacement}
        />
        <Popover
          id="trusted-service-popover"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          classes={{ paper: classes.popoverPaper }}
        >
          {selectedElements().map((ts) => (
            <BaseIconButton
              key={ts.tooltip}
              tooltip={{
                name: ts.tooltip,
                icon: imgSrc(ts.icon),
              }}
              onClick={() => {
                if (!isEnabled) return;
                ts.onClick(props.collectionUid, props.imageUid);
              }}
              enabled={isEnabled}
              tooltipPlacement={props.tooltipPlacement}
            />
          ))}
        </Popover>
      </>
    );
  }
  return null;
};

TSButtonToolbar.defaultProps = {
  enabled: true,
  tooltipPlacement: "right",
};
