import { useState } from "react";
import SVG from "react-inlinesvg";
import {
  Avatar,
  Card,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Box,
} from "@material-ui/core";
import { useAuth } from "@/hooks/use-auth";
import { imgSrc, theme } from "@/theme";

import { HtmlTooltip } from "@/components/HtmlTooltip";

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
    padding: "16px 14px",
  },
  editAvatar: {
    display: "inline-flex",
    width: "30px",
    height: "30px",
    marginLeft: "50%",
  },
  card: {
    backgroundColor: theme.palette.primary.light,
    width: "50%",
    marginTop: "150px",
  },
  typographyHeader: {
    display: "inline",
    marginLeft: "18px",
    fontWeight: 500,
  },
  boxTypography: {
    color: theme.palette.text.secondary,
    marginRight: "20px",
  },
  svgSmall: { width: "22px", height: "100%" },
}));

export function Account(): JSX.Element {
  const classes = useStyles();
  const [hover, sethover] = useState(false);
  const auth = useAuth();

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
              className={classes.editAvatar}
              onMouseOut={() => {
                sethover(false);
              }}
              onMouseOver={() => {
                sethover(true);
              }}
            >
              <IconButton>
                <SVG
                  src={imgSrc("edit-details")}
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
        <div style={{ display: "flex" }}>
          <Box>
            <Avatar className={classes.avatar}>
              <Typography style={{ fontSize: "50px" }}>H</Typography>
            </Avatar>
          </Box>

          <Box style={{ marginTop: "30px" }}>
            <Typography>
              <span className={classes.boxTypography}>Name:</span> John
            </Typography>
            <Typography>
              <span className={classes.boxTypography}>E-mail Address:</span>
              {auth.user && auth.user.username}
            </Typography>
            <Typography>
              <span className={classes.boxTypography}>Password:</span> *********
            </Typography>
          </Box>
        </div>
      </Card>
    </Grid>
  );
}
