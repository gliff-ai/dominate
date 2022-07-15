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
} from "@gliff-ai/curate";
import { PluginsZooCard } from "./PluginsZooCard";
import { useZooData, ExtendedPlugin } from "@/hooks";

const PLUGINS_KEYLABELS_MAP = {
  name: "Name",
  type: "Type",
  description: "Description",
  author: "Author",
  security: "Security",
  architecture: "Architecture",
  url: "URL",
  enabled: "Enabled",
  is_public: "Public",
  collection_uids: "Project UIDs",
  products: "Products",
};

const EXCLUDED_KEYS = ["public_key", "encrypted_access_key", "username"];

export enum ActiveSection {
  plugins,
  datasets,
}

interface Props {
  rerender?: number;
  activatePlugin: (plugin: Plugin) => Promise<unknown>;
}

export function ZooDialog({
  rerender,
  activatePlugin,
}: Props): ReactElement | null {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    ActiveSection.plugins
  );
  const zoo = useZooData({ activeSection, rerender });

  const filters = useMemo(() => new Filters(), [activeSection]);

  if (!zoo) return null;

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
                data={zoo.data}
                updateData={zoo.updateData}
                getLabelsFromKeys={getLabelsFromKeys(PLUGINS_KEYLABELS_MAP)(
                  EXCLUDED_KEYS
                )}
                showGroupBy={false}
              />
            </MuiCard>
          </div>
          <SearchBar
            filters={filters}
            data={zoo.data}
            updateData={zoo.updateData}
            getLabelsFromKeys={getLabelsFromKeys(PLUGINS_KEYLABELS_MAP)(
              EXCLUDED_KEYS
            )}
          />
          <SearchFilterCard filters={filters} updateData={zoo.updateData} />
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
            {(
              zoo.data.filter(
                ({ filterShow }) => filterShow
              ) as ExtendedPlugin[]
            ).map(
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
                        data={item}
                        isOpen={openCard === item.name}
                        openCard={() => setOpenCard(item.name)}
                        closeCard={() => setOpenCard(null)}
                        activatePlugin={activatePlugin}
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

ZooDialog.defaultProps = {
  rerender: null,
};
