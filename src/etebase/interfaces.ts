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

type ImageBitmapBlob = string; // TMP
type Channels = ImageBitmapBlob[]
type Slices = Channels[];

interface Image {
  meta: {
    type: "gliff.image";
    name: string; // human-readable gallery name, i.e. file name
    slices: number; // number of z-slices
    channels: number; // numbers colour channels
    createdTime: number; // time item was created in milliseconds since epoch
    modifiedTime: number; // time item was last modified in milliseconds since epoch
    width: number; // width of each slice
    height: number; // height of each slice
    format: "WebP"; // Maybe other later, maybe we dont convert PNG etc to this
    description?: string; // long description for collection, i.e. project details
    customMeta?: string; // JSON of custom metadata
  };
  content: Slices[]
}

export {Gallery, Image, Thumbnail, Annotation}
