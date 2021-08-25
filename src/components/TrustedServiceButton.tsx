import { BaseIconButton } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";
import TrustedServicePlugin from "@/plugins/TrustedServicePlugin";

interface Props {
  collectionUid: string;
  imageUid: string;
  plugin: TrustedServicePlugin;
}

export function TrustedServiceButton({
  collectionUid,
  imageUid,
  plugin,
}: Props): React.ReactElement {
  return (
    <BaseIconButton
      tooltip={{
        name: plugin.tooltip,
        icon: imgSrc(plugin.icon),
      }}
      onClick={() => plugin.onClick(collectionUid, imageUid)}
    />
  );
}
