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
import { theme } from "@gliff-ai/style";
import { Link } from "react-router-dom";
import { imgSrc } from "@/imgSrc";

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
    marginLeft: "70%",
    top: "-25px",
  },
  card: {
    backgroundColor: theme.palette.primary.light,
    width: "fit-content",
    margin: "150px 50px",
  },
  box: {
    display: "flex",
    flexWrap: "wrap",
  },
  typographyHeader: {
    display: "inline",
    marginLeft: "18px",
    fontWeight: 500,
  },
  spanTypography: {
    display: "inline",
    fontWeight: 500,
    marginLeft: "30px",
    color: theme.palette.text.primary,
  },
  boxTypography: {
    color: theme.palette.text.secondary,
    marginRight: "20px",
    marginBottom: "30px",
    marginTop: "20px",
  },
  svgSmall: { width: "22px", height: "100%" },
}));

export function Account(): JSX.Element {
  const classes = useStyles();
  const auth = useAuth();

  const editpasswordButton = (
    <HtmlTooltip
      title={<Typography color="inherit">Edit Password</Typography>}
      placement="right"
    >
      <Avatar className={classes.editAvatar}>
        <Link to="/reset-password">
          <IconButton>
            <SVG src={imgSrc("edit-details")} className={classes.svgSmall} />
          </IconButton>
        </Link>
      </Avatar>
    </HtmlTooltip>
  );

  return (
    <Grid>
      <Card className={classes.card}>
        <Paper elevation={0} variant="outlined" className={classes.paperHeader}>
          <Typography className={classes.typographyHeader}>
            John&apos;s Account Overview
          </Typography>
        </Paper>
        <Box className={classes.box}>
          <Box>
            <Avatar className={classes.avatar}>
              <Typography style={{ fontSize: "50px" }}>H</Typography>
            </Avatar>
          </Box>

          <Box style={{ margin: "30px 30px" }}>
            <Typography className={classes.boxTypography}>
              Name: <span className={classes.spanTypography}>John</span>
            </Typography>
            <Typography className={classes.boxTypography}>
              E-mail Address:
              <span className={classes.spanTypography}>
                {auth.user && auth.user.username}
              </span>
            </Typography>
            <Typography component="span" className={classes.boxTypography}>
              Password:
              <span className={classes.spanTypography}>*********</span>
              {editpasswordButton}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Grid>
  );
}
