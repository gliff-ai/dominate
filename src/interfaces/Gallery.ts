import { FileInfo } from "./shared";

// ----------------------------- META -----------------------------
interface GalleryMetaV0 {
  version: 0;
  type: "gliff.gallery";
  name: string; // "human-readable gallery name, i.e. folder name"
  createdTime: number; // "time item was created in milliseconds since epoch"
  modifiedTime: number; // "time item was last modified in milliseconds since epoch"
  description?: string; // "long description for collection, i.e. project details"
  defaultLabels: string[];
  restrictLabels: boolean;
  multiLabel: boolean;
}

// ----------------------------- CONTENT -----------------------------

type GalleryContentV0 = GalleryTileV0[];

// Gallery collection content is an array of these objects
interface GalleryTileV0 {
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

const migrations = [
  // example migration:
  // {
  //   meta: (oldMeta: GalleryMetaV0): GalleryMetaV1 => {
  //     const newMeta: GalleryMetaV1 = { ...oldMeta, version: 1, hello: "world" };
  //     return newMeta;
  //   },
  //   content: null,
  // },
];

export {
  GalleryMetaV0 as GalleryMeta,
  GalleryContentV0 as GalleryContent,
  GalleryTileV0 as GalleryTile,
  migrations as GalleryMigrations,
};
