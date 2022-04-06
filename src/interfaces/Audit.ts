import { BaseMeta } from "./shared";

// ----------------------------- META -----------------------------

interface AuditMetaV0 extends BaseMeta {
  meta_version: 0;
  content_version: 0;
  type: "gliff.audit";
  createdTime: number;
  modifiedTime: number;
}

const metaMigrations = [];
const contentMigrations = [];

export {
  AuditMetaV0 as AuditMeta,
  metaMigrations as AuditMetaMigrations,
  contentMigrations as AuditContentMigrations,
};
