import { ReactElement, useState, MouseEvent } from "react";
import { makeStyles, Popover } from "@material-ui/core";
import { BaseIconButton } from "@gliff-ai/style";
import { TSButton } from "./TSButton";
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
}

export function TSButtonToolbar(props: Props): ReactElement | null {
  const trustedService = useTrustedService();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const classes = useStyle();

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return trustedService.ready ? (
    <>
      <BaseIconButton
        tooltip={{
          name: "Trusted Services",
          icon: imgSrc("annotate"),
        }} // TODO: replace icon!
        onClick={handleClick}
      />
      <Popover
        id="trusted-service-popover"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        classes={{ paper: classes.popoverPaper }}
      >
        {trustedService.uiElements.map((plugin) =>
          plugin.placement.includes(props.placement) ? (
            <TSButton
              key={`${plugin.trustedService}-${plugin.value}`}
              plugin={plugin}
              collectionUid={props.collectionUid}
              imageUid={props.imageUid}
            />
          ) : null
        )}
      </Popover>
    </>
  ) : null;
}
