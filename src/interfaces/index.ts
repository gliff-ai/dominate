interface MetaItem {
  // as seen in CURATE
  [index: string]: string | string[] | boolean | number;
}

type Metadata = MetaItem[];

export type { Metadata };
