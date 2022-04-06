import { FileInfo, BaseMeta } from "./shared";

// ----------------------------- META -----------------------------

interface ImageMetaV0 extends BaseMeta {
  meta_version: 0;
  content_version: 0;
  type: "gliff.image";
  name: string; // human-readable image name, i.e. file name
  fileInfo: FileInfo;
  createdTime: number; // time item was created in milliseconds since epoch
  modifiedTime: number; // time item was last modified in milliseconds since epoch
  description?: string; // long description for collection, i.e. project details
  customMeta?: string; // JSON of custom metadata
  format?: "WebP"; // Maybe other later, maybe we dont convert PNG etc to this
}

const metaMigrations = [];
const contentMigrations = [];

export {
  ImageMetaV0 as ImageMeta,
  metaMigrations as ImageMetaMigrations,
  contentMigrations as ImageContentMigrations,
};
