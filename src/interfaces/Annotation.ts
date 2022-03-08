// ----------------------------- META -----------------------------

interface AnnotationMetaV0 {
  isComplete: boolean;
  type?: string;
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
