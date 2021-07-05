import { useState } from "react";
import {
  Avatar,
  Card,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import { theme } from "@/theme";
import SVG from "react-inlinesvg";

const useStyles = makeStyles(() => ({
  avatar: {
    width: "199px",
    height: "199px",
    backgroundColor: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.text.secondary,
    },
    margin: "20px",
  },
  paperHeader: {
    backgroundColor: theme.palette.primary.main,
    width: "100%",
    borderRadius: 0,
    border: "none",
    boxShadow: "none",
    display: "inline-flex",
  },
  closeAvatar: {
    display: "inline-flex",
    width: "30px",
    height: "30px",
    marginLeft: "360px",
  },
  card: {
    backgroundColor: theme.palette.primary.light,
    width: "50%",
  },
  typographyHeader: {
    display: "inline",
    marginLeft: "18px",
    fontWeight: 500,
  },
  svgSmall: { width: "12px", height: "100%" },
}));

const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);

export function Account(): JSX.Element {
  const classes = useStyles();
  const [hover, sethover] = useState(false);

  return (
    <Grid>
      <Card className={classes.card}>
        <Paper elevation={0} variant="outlined" className={classes.paperHeader}>
          <Typography className={classes.typographyHeader}>
            John&apos;s Account Overview
          </Typography>
          <HtmlTooltip
            title={<Typography color="inherit">Account</Typography>}
            placement="top"
          >
            <Avatar
              variant="circle"
              className={classes.closeAvatar}
              onMouseOut={() => {
                sethover(false);
              }}
              onMouseOver={() => {
                sethover(true);
              }}
            >
              <IconButton>
                <SVG
                  src={require("../assets/edit-details.svg") as string}
                  className={classes.svgSmall}
                  fill={
                    hover
                      ? theme.palette.primary.main
                      : theme.palette.text.primary
                  }
                />
              </IconButton>
            </Avatar>
          </HtmlTooltip>
        </Paper>
        <Paper>
          <Avatar className={classes.avatar}>H</Avatar>
        </Paper>
      </Card>
    </Grid>
  );
}
