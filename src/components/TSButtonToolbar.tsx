import { ReactElement, useState, MouseEvent } from "react";
import { makeStyles, Popover, TooltipProps } from "@material-ui/core";
import { BaseIconButton } from "@gliff-ai/style";
import { useTrustedService } from "@/hooks/use-trustedService";
import { imgSrc } from "@/imgSrc";

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

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const selectedElements = () =>
    trustedService.uiElements.filter((ts) =>
      ts.placement.includes(props.placement)
    );

  const isEnabled = (): boolean => selectedElements().length && props.enabled;

  return trustedService.ready ? (
    <>
      <BaseIconButton
        tooltip={{
          name: "Trusted Services",
          icon: imgSrc("annotate"),
        }} // TODO: replace icon!
        onClick={handleClick}
        enabled={isEnabled()}
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
            tooltip={{
              name: ts.tooltip,
              icon: imgSrc(ts.icon),
            }}
            onClick={() => ts.onClick(props.collectionUid, props.imageUid)}
            enabled={isEnabled()}
            tooltipPlacement={props.tooltipPlacement}
          />
        ))}
      </Popover>
    </>
  ) : null;
};

TSButtonToolbar.defaultProps = {
  enabled: true,
  tooltipPlacement: "right",
};
