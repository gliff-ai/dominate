import { CSSProperties } from "react";
import { Card, makeStyles, Paper, Typography } from "@material-ui/core";
import { theme } from "@gliff-ai/style";

interface Props {
  title: string;
  el: JSX.Element;
  cardStyle?: CSSProperties;
}

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  projectsTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "10px",
  },
});

export function GliffCard(props: Props): JSX.Element {
  const classes = useStyles();
  return (
    <>
      <Card style={props.cardStyle}>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.projectsTopography}>
            {props.title}
          </Typography>
        </Paper>

        <Paper elevation={0} square style={{ padding: "20px" }}>
          {props.el}
        </Paper>
      </Card>
    </>
  );
}

GliffCard.defaultProps = {
  cardStyle: {},
};
