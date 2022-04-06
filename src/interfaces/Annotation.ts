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

interface AnnotationMetaV1 extends BaseMeta {
  meta_version: 1;
  content_version: 0;
  type: "gliff.annotation";
  isComplete: boolean;
  name?: string;
  modifiedTime?: number;
  description?: string;
  color?: string;
  createdTime?: number;
}

const metaMigrations = [
  (oldMeta: AnnotationMetaV0): AnnotationMetaV1 => {
    let newMeta: AnnotationMetaV1;
    if ("mtime" in oldMeta) {
      newMeta = {
        ...oldMeta,
        meta_version: 1,
        modifiedTime: oldMeta.mtime,
      } as AnnotationMetaV1;
      delete (newMeta as AnnotationMetaV1 & { mtime?: number }).mtime;
    } else {
      newMeta = {
        ...oldMeta,
        meta_version: 1,
        modifiedTime: oldMeta.createdTime,
      } as AnnotationMetaV1;
    }
    return newMeta;
  },
];

const contentMigrations = [];

export {
  AnnotationMetaV1 as AnnotationMeta,
  metaMigrations as AnnotationMetaMigrations,
  contentMigrations as AnnotationContentMigrations,
};
