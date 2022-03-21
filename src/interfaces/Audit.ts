// ----------------------------- META -----------------------------

interface AuditMetaV0 {
  version: 0;
  type: "gliff.audit";
  createdTime: number;
  modifiedTime: number;
}

const migrations = [];

export { AuditMetaV0 as AuditMeta, migrations as AuditMigrations };
