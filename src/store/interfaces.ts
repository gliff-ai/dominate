interface GalleryMeta {
  uid: string;
  type: "gliff.gallery";
  name: string; // "human-readable gallery name, i.e. folder name"
  createdTime: number; // "time item was created in milliseconds since epoch"
  modifiedTime: number; // "time item was last modified in milliseconds since epoch"
  description?: string; // "long description for collection, i.e. project details"
}

// Gallery collection content is an array of these objects
interface GalleryTile {
  fileInfo: FileInfo;
  imageLabels: string[];
  assignees: string[]; // collaborator(s) to whome the image has been assigned
  thumbnail: string; // base64
  id: string; // an id representing the whole unit (image, annotation and audit), expected by curate. should be the same as imageUID (a convention for the sake of simplicity).
  imageUID: string;
  annotationUID: Record<string, string>;
  annotationComplete: { [username: string]: boolean };
  auditUID: Record<string, string>;
}

interface MetaItem {
  // as seen in CURATE
  [index: string]: string | string[] | boolean | number;
}

type ImageBitmapBlob = ImageBitmap;
type Channels = ImageBitmapBlob[];
type Slices = Channels[];
interface ImageItemMeta {
  uid: string;
  name: string; // human-readable image name, i.e. file name
  type: "gliff.image";
  fileInfo: FileInfo;
  createdTime: number; // time item was created in milliseconds since epoch
  modifiedTime: number; // time item was last modified in milliseconds since epoch
  description?: string; // long description for collection, i.e. project details
  customMeta?: string; // JSON of custom metadata
  format?: "WebP"; // Maybe other later, maybe we dont convert PNG etc to this
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

interface AnnotationMeta {
  uid: string;
  isComplete: boolean;
  type?: string;
  name?: string;
  mtime?: number;
  description?: string;
  color?: string;
  createdTime?: number;
}

export type {
  GalleryMeta,
  GalleryTile,
  MetaItem,
  Slices,
  ImageItemMeta,
  FileInfo,
  AnnotationMeta,
};
