// ----------------------------- META -----------------------------

interface AnnotationMetaV0 {
  version: 0;
  type: "gliff.annotation";
  isComplete: boolean;
  name?: string;
  mtime?: number;
  description?: string;
  color?: string;
  createdTime?: number;
}

const migrations = [];

export {
  AnnotationMetaV0 as AnnotationMeta,
  migrations as AnnotationMigrations,
};
