import { ReactElement, useMemo, useState } from "react";
import {
  Dialog,
  Grid,
  IconButton,
  icons,
  MuiCard,
  theme,
} from "@gliff-ai/style";

import {
  SortPopover,
  Filters,
  getLabelsFromKeys,
  SearchBar,
  SearchFilterCard,
} from "@gliff-ai/curate";
import { ZooCard, ZooCardData } from "./ZooCard";

const PLUGINS_KEYLABELS_MAP = {
  name: "Name",
  type: "Type",
  description: "Description",
  author: "Author",
  security: "Security",
  architecture: "Architecture",
};

enum ActiveSection {
  plugins,
  datasets,
}

interface Props {
  plugins: ZooCardData[];
  datasets: ZooCardData[];
}

export function ZooDialog(props: Props): ReactElement {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    ActiveSection.plugins
  );
  const filters = useMemo(() => new Filters(), [activeSection]);

  const data = useMemo(
    () =>
      activeSection === ActiveSection.plugins ? props.plugins : props.datasets,
    [activeSection, props.plugins, props.datasets]
  );

  return (
    <Dialog
      title="EXPLORE"
      TriggerButton={
        <IconButton
          icon={icons.zoo}
          tooltip={{
            name: "Explore",
            icon: icons.betaStatus,
          }}
        />
      }
      backgroundColor={theme.palette.background.default}
    >
      <Grid
        container
        width="1200px"
        height="780px"
        direction="row"
        justifyContent="center"
        alignItems="top"
        spacing={2}
      >
        <Grid
          item
          xs={3}
          alignItems="right"
          display="flex"
          flexDirection="column"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <MuiCard sx={{ width: "fit-content" }} variant="outlined">
              <IconButton
                icon={icons.plugins}
                tooltip={{
                  name: "View Plugins",
                }}
                fill={activeSection === ActiveSection.plugins}
                tooltipPlacement="top-start"
                onClick={() => setActiveSection(ActiveSection.plugins)}
              />
              <IconButton
                icon={icons.imageViewer}
                tooltip={{
                  name: "View Datasets",
                }}
                fill={activeSection === ActiveSection.datasets}
                tooltipPlacement="top-start"
                onClick={() => setActiveSection(ActiveSection.datasets)}
              />
            </MuiCard>

            <MuiCard sx={{ width: "fit-content" }} variant="outlined">
              <SortPopover
                filters={filters}
                data={data}
                updateData={() => {}}
                getLabelsFromKeys={getLabelsFromKeys(PLUGINS_KEYLABELS_MAP)()}
              />
            </MuiCard>
          </div>

          <MuiCard sx={{ marginTop: "20px" }} variant="outlined">
            <SearchBar
              filters={filters}
              data={data}
              updateData={() => {}}
              getLabelsFromKeys={getLabelsFromKeys(PLUGINS_KEYLABELS_MAP)()}
            />
            <SearchFilterCard filters={filters} updateData={() => {}} />
          </MuiCard>
        </Grid>
        <Grid item xs={9}>
          <Grid
            sx={{
              overflow: "auto",
              height: "750px",
              paddingBottom: "10px",
            }}
            container
            spacing={2}
          >
            {data
              .filter(({ filterShow }) => filterShow)
              .map(
                (item) =>
                  (!openCard || openCard === item.name) && (
                    <Grid sx={{ height: "fit-content" }} item xs={3}>
                      <ZooCard
                        data={item}
                        isOpen={openCard === item.name}
                        openCard={() => setOpenCard(item.name)}
                        closeCard={() => setOpenCard(null)}
                      />
                    </Grid>
                  )
              )}
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
}
