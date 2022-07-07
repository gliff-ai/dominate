import { ReactElement, useMemo, useState } from "react";
import {
  Dialog,
  Grid,
  IconButton,
  icons,
  MuiCard,
  theme,
} from "@gliff-ai/style";
import { Plugin } from "@gliff-ai/manage";
import {
  SortPopover,
  Filters,
  getLabelsFromKeys,
  SearchBar,
  SearchFilterCard,
  FilterData,
} from "@gliff-ai/curate";
import { PluginsZooCard } from "./PluginsZooCard";

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

interface Dataset {
  name: string;
  author: string;
  type: string;
  description: string;
  url: string;
}

interface Props {
  plugins: Plugin[] | null;
  datasets: Dataset[] | null;
}

export function ZooDialog(props: Props): ReactElement | null {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    ActiveSection.plugins
  );

  const filters = useMemo(() => new Filters(), [activeSection]);

  const data = useMemo(
    () =>
      (activeSection === ActiveSection.plugins
        ? props.plugins
        : props.datasets
      )?.map((d: Plugin | Dataset) => ({
        ...d,
        filterShow: true,
        newGroup: false,
      })),
    [activeSection, props.plugins, props.datasets]
  );

  if (!data) return null;

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
                data={data as FilterData}
                updateData={() => {}}
                getLabelsFromKeys={getLabelsFromKeys(PLUGINS_KEYLABELS_MAP)()}
              />
            </MuiCard>
          </div>
          <SearchBar
            filters={filters}
            data={data as FilterData}
            updateData={() => {}}
            getLabelsFromKeys={getLabelsFromKeys(PLUGINS_KEYLABELS_MAP)()}
          />
          <SearchFilterCard filters={filters} updateData={() => {}} />
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
                    <Grid
                      key={item.name}
                      sx={{ height: "fit-content" }}
                      item
                      xs={3}
                    >
                      {activeSection === ActiveSection.plugins ? (
                        <PluginsZooCard
                          data={item as Plugin}
                          isOpen={openCard === item.name}
                          openCard={() => setOpenCard(item.name)}
                          closeCard={() => setOpenCard(null)}
                        />
                      ) : null}
                    </Grid>
                  )
              )}
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
}
