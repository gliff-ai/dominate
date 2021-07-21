import { Theme, Tooltip, withStyles } from "@material-ui/core";
import { theme, veryLightBlue } from "@gliff-ai/style";

export const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: t.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid",
    borderColor: veryLightBlue,
    color: theme.palette.text.primary,
  },
}))(Tooltip);
