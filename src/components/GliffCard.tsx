import { CSSProperties } from "react";
import { Card, makeStyles, Paper, Typography } from "@material-ui/core";
import { theme, BaseIconButton } from "@gliff-ai/style";

interface Props {
  title: string;
  el: JSX.Element;
  cardStyle?: CSSProperties;
  action?: {
    icon: string;
    tooltip: string;
    onClick: () => void;
  };
}

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
    position: "relative",
  },
  projectsTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "10px",
  },
  actionButton: {
    position: "absolute",
    right: "3px",
    top: "2px",
    "& > button": {
      marginTop: 0,
    },
  },
});

export function GliffCard(props: Props): JSX.Element {
  const classes = useStyles();

  const action = !props.action ? null : (
    <div className={classes.actionButton}>
      <BaseIconButton
        tooltip={{
          name: props.action.tooltip,
          icon: props.action.icon,
        }}
        tooltipPlacement="bottom"
        onClick={props.action.onClick}
      />
    </div>
  );

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
          {action}
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
  action: null,
};
