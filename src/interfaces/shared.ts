interface BaseMeta {
  meta_version: number;
  content_version: number;
  type: string;
}

interface FileInfo {
  // the stuff in ImageFileInfo
  fileName: string;
  num_slices: number; // number of z-slices
  num_channels: number; // numbers colour channels
  width: number; // width of each slice
  height: number; // height of each slice
  size: number; // size of the image in bytes
  resolution_x?: number;
  resolution_y?: number;
  resolution_z?: number;
  content_hash?: string; // we use this for making sure we don't have duplicate images in a dataset
}

interface DemoMetadata {
  fileInfo: Pick<Partial<FileInfo>, "fileName" | "size">;
  imageLabels: string[];
}

export { FileInfo, BaseMeta, DemoMetadata };
