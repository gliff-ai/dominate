interface Gallery {
  uid: string;
  type: "gliff.gallery";
  name: string; // "human-readable gallery name, i.e. folder name"
  createdTime: number; // "time item was created in milliseconds since epoch"
  modifiedTime: number; // "time item was last modified in milliseconds since epoch"
  description?: string; // "long description for collection, i.e. project details"
}

interface Thumbnail {
  uid: string;
  type: "gliff.thumbnail";
  imageUid: string; // The gliff.image that this is a thumbnail of
  createdTime: number; // "time item was created in milliseconds since epoch"
  modifiedTime: number; // "time item was last modified in milliseconds since epoch"
}

interface Annotation extends Omit<Thumbnail, "type"> {
  type: "gliff.thumbnail";
  labels: string[];
}

type ImageBitmapBlob = ImageBitmap; // TMP
type Channels = ImageBitmapBlob[];
type Slices = Channels[];

interface Image {
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
  num_slices: number; // number of z-slices
  num_channels: number; // numbers colour channels
  width: number; // width of each slice
  height: number; // height of each slice
  size: number; // size of the image in bytes
  resolution_x: number;
  resolution_y: number;
  resolution_z: number;
  format?: "WebP"; // Maybe other later, maybe we dont convert PNG etc to this
  customMeta?: string; // JSON of custom metadata
}

export { Gallery, Image, Thumbnail, Annotation, Slices, ImageMeta };
