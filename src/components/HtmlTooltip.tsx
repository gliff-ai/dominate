import { Theme, Tooltip, withStyles } from "@material-ui/core";
import { veryLightBlue } from "@gliff-ai/style";

export const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid",
    borderColor: veryLightBlue,
    color: theme.palette.text.primary,
  },
}))(Tooltip);
