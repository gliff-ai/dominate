import { ReactElement } from "react";
import { BaseIconButton } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";
import TrustedServicePlugin from "@/plugins/TrustedServicePlugin";

interface Props {
  collectionUid: string;
  imageUid: string;
  plugin: TrustedServicePlugin;
}

export function TSButton({
  collectionUid,
  imageUid,
  plugin,
}: Props): ReactElement {
  return (
    <>
      <BaseIconButton
        tooltip={{
          name: plugin.tooltip,
          icon: imgSrc(plugin.icon),
        }}
        onClick={() => plugin.onClick(collectionUid, imageUid)}
      />
    </>
  );
}
