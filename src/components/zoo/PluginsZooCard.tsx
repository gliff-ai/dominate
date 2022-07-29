import { ReactElement, useMemo } from "react";
import { Plugin } from "@gliff-ai/manage";
import { Divider, icons, MuiCard, Box, theme, Button } from "@gliff-ai/style";
import { DialogActions } from "@mui/material";
import SVG from "react-inlinesvg";

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
  data: Plugin;
  isOpen: boolean;
  openCard: () => void;
  closeCard: () => void;
  activatePlugin: (plugin: Plugin) => Promise<unknown>;
}

export const PluginsZooCard = ({
  data,
  isOpen,
  openCard,
  closeCard,
  activatePlugin,
}: Props): ReactElement => {
  const scale = useMemo((): number => Number(isOpen) + 1, [isOpen]);

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
            {data?.author}
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
          color="secondary"
          variant="outlined"
          onClick={isOpen ? closeCard : openCard}
          text={isOpen ? "Go Back" : "See More"}
        />
        <Button
          text="Activate"
          color="primary"
          onClick={() => {
            void activatePlugin(data);
          }}
        />
      </DialogActions>
    </MuiCard>
  );
};
