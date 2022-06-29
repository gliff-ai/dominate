import { ReactElement, useMemo } from "react";
import { Divider, icons, MuiCard, Box, Button, theme } from "@gliff-ai/style";
import { DialogActions } from "@mui/material";
import SVG from "react-inlinesvg";
import { FilterDataItem } from "@gliff-ai/curate";

interface Data extends FilterDataItem {
  name: string;
  author: string;
  description: string;
  type: string;
}

const InconText = ({
  icon,
  text,
  marginLeft = null,
}: {
  icon: string;
  text: string;
  marginLeft?: string | null;
}) => (
  <div>
    <SVG
      src={icon}
      style={{
        width: "25px",
        height: "25px",
        marginRight: "12px",
        fontSize: "16px",
        marginBottom: "-5px",
        marginLeft: `${marginLeft || 0}`,
      }}
    />
    {text}
  </div>
);

InconText.defaultProps = { marginLeft: null };

interface Props {
  data: Data;
  isOpen: boolean;
  openCard: () => void;
  closeCard: () => void;
}

export const PluginsZooCard = ({
  data,
  isOpen,
  openCard,
  closeCard,
}: Props): ReactElement => {
  const scale = useMemo((): number => Number(isOpen) + 1, [isOpen]);
  console.log(scale);

  return (
    <MuiCard
      sx={{
        display: "flex",
        flexDirection: "column",
        width: isOpen ? "870px" : "400px",
        height: isOpen ? "650px" : "auto",
        padding: isOpen ? "20px" : "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "end",
          marginBottom: scale * 10,
        }}
      >
        <Box
          style={{
            width: scale * 60,
            height: scale * 60,
            borderRadius: "9px",
            backgroundColor: theme.palette.primary.main,
          }}
        />
        <div style={{ marginLeft: "10px" }}>
          <h3 style={{ lineHeight: "1px" }}>Plugin: {data.name}</h3>
          <span style={{ lineHeight: 0, color: theme.palette.text.secondary }}>
            {data.author}
          </span>
        </div>
      </div>
      {!isOpen && (
        <Box
          sx={{
            marginBottom: "20px",
            overflow: "hidden",
            display: "-webkit-box",
            "-webkit-box-orient": "vertical",
            "-webkit-line-clamp": "4",
            height: "80px",
          }}
        >
          {data.description}
        </Box>
      )}
      <MuiCard
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: isOpen ? "start" : "center",
          alignItems: "center",
          backgroundColor: "transparent",
          border: `solid 2px ${theme.palette.grey[300]}`,
          padding: "10px",
        }}
      >
        <InconText
          icon={icons.security}
          text={data.type === "Javascript" ? "Aluminuium" : "Titanium"}
        />
        <InconText
          icon={icons.build}
          text={data.type === "Javascript" ? "Front-end" : "Back-end"}
          marginLeft="15px"
        />
        <InconText
          icon={icons.projectsPage}
          text={data.type}
          marginLeft="15px"
        />
      </MuiCard>
      {isOpen && (
        <Box sx={{ marginTop: "20px", height: "100%" }}>{data.description}</Box>
      )}
      <Divider sx={{ width: "110%", margin: "10px 0 10px -5%" }} />
      <DialogActions
        sx={{ justifyContent: "space-between", padding: 0, marginBottom: 0 }}
      >
        <Button
          sx={{
            textTransform: "none",
            backgroundColor: "transparent",
            border: `2px solid ${theme.palette.grey[300]} !important`,
            ":hover": {
              borderColor: theme.palette.grey[300],
            },
          }}
          variant="outlined"
          onClick={isOpen ? closeCard : openCard}
        >
          {isOpen ? "Go Back" : "See More"}
        </Button>
        <Button
          sx={{
            textTransform: "none",
            backgroundColor: `${theme.palette.primary.main} !important`,
            borderColor: `${theme.palette.primary.main} !important`,
            ":hover": {
              backgroundColor: theme.palette.secondary.main,
            },
          }}
          variant="outlined"
          onClick={() => console.log("activate")}
        >
          Activate
        </Button>
      </DialogActions>
    </MuiCard>
  );
};
