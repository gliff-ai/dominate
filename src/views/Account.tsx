import { ReactElement } from "react";
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
import { Link } from "react-router-dom";
import { HtmlTooltip } from "@/components/HtmlTooltip";

const useStyles = makeStyles({
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
    marginLeft: "18px",
    position: "relative",
    display: "inline-flex",
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
  avatarTopography: { fontSize: "50px" },
  boxInfo: { margin: "30px 30px" },
});

export function Account(): ReactElement {
  const auth = useAuth();
  const classes = useStyles();

  const getInitials = (name: string): string =>
    name
      .split(" ")
      .map((l) => l[0].toUpperCase())
      .join("");

  return auth?.user && auth?.userProfile ? (
    <Grid>
      <Card className={classes.card}>
        <Paper elevation={0} variant="outlined" className={classes.paperHeader}>
          <Typography className={classes.typographyHeader}>
            Account Overview
          </Typography>
        </Paper>
        <Box className={classes.box}>
          <Box>
            <Avatar className={classes.avatar}>
              <Typography className={classes.avatarTopography}>
                {getInitials(auth?.userProfile?.name)}
              </Typography>
            </Avatar>
          </Box>

          <Box className={classes.boxInfo}>
            <Typography className={classes.boxTypography}>
              Name:
              <span className={classes.spanTypography}>
                {auth?.userProfile?.name}
              </span>
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
              <HtmlTooltip
                title={<Typography color="inherit">Edit Password</Typography>}
                placement="right"
              >
                <Avatar className={classes.editAvatar}>
                  <Link to="/reset-password">
                    <IconButton>
                      <SVG
                        src={imgSrc("edit-details")}
                        className={classes.svgSmall}
                      />
                    </IconButton>
                  </Link>
                </Avatar>
              </HtmlTooltip>
            </Typography>
            <Typography className={classes.boxTypography}>
              Team&apos;s Storage Usage:
              <span
                className={classes.spanTypography}
              >{`${auth?.userProfile?.team?.usage} MB`}</span>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Grid>
  ) : null;
}
