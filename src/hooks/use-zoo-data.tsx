import { useEffect, useState } from "react";
import type { Plugin } from "@gliff-ai/manage";
import { FilterData, FilterDataItem } from "@gliff-ai/curate";
import { getZooPlugins } from "@/services/plugins";
import { ActiveSection } from "../components/zoo/ZooDialog";

interface Output {
  data: FilterData;
  updateData: (func: (data: FilterData) => FilterData) => void;
}

// TODO: fix this interface when working on datasets
interface Dataset {
  name?: string;
  url?: string;
}

interface Props {
  activeSection: number;
  rerender?: number;
}

export interface ExtendedPlugin extends Plugin, FilterDataItem {}
export interface ExtendedDataset extends Dataset, FilterDataItem {}

export function useZooData({ activeSection, rerender }: Props): Output | null {
  const [data, setData] =
    useState<ExtendedPlugin[] | ExtendedDataset[] | null>(null);

  const addFilterDataKeys = (
    _data: Plugin[] | Dataset[]
  ): ExtendedPlugin[] | ExtendedDataset[] =>
    _data.map((d: Plugin | Dataset) => ({
      ...d,
      filterShow: true,
      newGroup: false,
    }));

  useEffect(() => {
    // work with plugins
    if (activeSection === ActiveSection.plugins) {
      void getZooPlugins().then((newPlugins) => {
        const plugins = newPlugins.filter((p) => p.is_public);
        setData(addFilterDataKeys(plugins));
      });
      return;
    }
    // work with datasets
    const dataset: Dataset[] = []; // TODO: fetch list of datasets from STORE
    setData(addFilterDataKeys(dataset));
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
  rerender: 0,
};
