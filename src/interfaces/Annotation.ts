import { BaseMeta } from "./shared";

// ----------------------------- META -----------------------------

interface AnnotationMetaV0 extends BaseMeta {
  meta_version: 0;
  content_version: 0;
  type: "gliff.annotation";
  isComplete: boolean;
  name?: string;
  mtime?: number;
  description?: string;
  color?: string;
  createdTime?: number;
}

const metaMigrations = [];
const contentMigrations = [];

export {
  AnnotationMetaV0 as AnnotationMeta,
  metaMigrations as AnnotationMetaMigrations,
  contentMigrations as AnnotationContentMigrations,
};
