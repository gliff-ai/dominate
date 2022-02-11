interface GalleryMeta {
  uid: string;
  type: "gliff.gallery";
  name: string; // "human-readable gallery name, i.e. folder name"
  createdTime: number; // "time item was created in milliseconds since epoch"
  modifiedTime: number; // "time item was last modified in milliseconds since epoch"
  description?: string; // "long description for collection, i.e. project details"
  defaultLabels: string[];
  restrictLabels: boolean;
  multiLabel: boolean;
}

// Gallery collection content is an array of these objects
interface GalleryTile {
  metadata: ImageMeta;
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

interface Image {
  // a sort of hybrid/union of etebase metadata and content for Image items
  uid: string;
  type: "gliff.image";
  name: string; // human-readable image name, i.e. file name
  createdTime: number; // time item was created in milliseconds since epoch
  modifiedTime: number; // time item was last modified in milliseconds since epoch
  description?: string; // long description for collection, i.e. project details
  meta: ImageMeta;
  content: string;
}

interface ImageMeta {
  // the stuff in ImageFileInfo
  imageName: string;
  num_slices: number; // number of z-slices
  num_channels: number; // numbers colour channels
  width: number; // width of each slicewrangled
  height: number; // height of each slice
  size: number; // size of the image in bytes
  resolution_x: number;
  resolution_y: number;
  resolution_z: number;
  format?: "WebP"; // Maybe other later, maybe we dont convert PNG etc to this
  content_hash?: string; // we use this for making sure we don't have duplicate images in a dataset
  customMeta?: string; // JSON of custom metadata
}

interface AnnotationMeta {
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
  Image,
  Slices,
  ImageMeta,
  AnnotationMeta,
};
