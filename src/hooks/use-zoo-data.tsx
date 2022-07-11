import { useEffect, useState } from "react";
import { getPlugins } from "@/services/plugins";
import { ActiveSection } from "../components/zoo/ZooDialog";
import { FilterData, Filters } from "@gliff-ai/curate";

interface Output {
  data: FilterData;
  updateData: (func: (data: FilterData) => FilterData) => void;
}

interface Props {
  activeSection: number;
  rerender?: number | null;
}

export function useZooData({ activeSection, rerender }: Props): Output | null {
  const [data, setData] = useState<FilterData | null>(null);

  useEffect(() => {
    // work with plugins
    if (activeSection === ActiveSection.plugins) {
      void getPlugins().then((newPlugins) => {
        const plugins = newPlugins.filter((p) => p.is_public);
        setData(Filters.convertToFilterData(plugins));
      });
      return;
    }
    // work with datasets
    // TODO: fetch list of datasets from STORE
    setData(Filters.convertToFilterData([]));
  }, [rerender, activeSection]);

  const updateData = (func: (data: FilterData) => FilterData): void => {
    setData((prevData) => func(prevData as FilterData));
  };

  return data
    ? {
        data,
        updateData,
      }
    : null;
}

useZooData.defaultProps = {
  rerender: null,
};
