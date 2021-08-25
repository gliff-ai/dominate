import { ReactElement } from "react";
import { TrustedServiceButton } from "./TrustedServiceButton";
import { useTrustedService } from "@/hooks/use-trustedService";

interface Props {
  placement: string;
  collectionUid: string;
  imageUid: string;
}

export function TrustedServiceToolbar(props: Props): ReactElement | null {
  const trustedService = useTrustedService();

  return trustedService.ready ? (
    <div id={`${props.placement}-plugins-toolbar`}>
      {trustedService.uiElements.map((plugin) =>
        plugin.placement.includes(props.placement) ? (
          <TrustedServiceButton
            key={`${plugin.trustedService}-${plugin.value}`}
            plugin={plugin}
            collectionUid={props.collectionUid}
            imageUid={props.imageUid}
          />
        ) : null
      )}
    </div>
  ) : null;
}
