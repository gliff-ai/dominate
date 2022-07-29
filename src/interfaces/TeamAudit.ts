import { BaseMeta } from "./shared";

// ----------------------------- META -----------------------------

interface TeamAuditMetaV0 extends BaseMeta {
  meta_version: 0;
  content_version: 0;
  type: "gliff.teamAudit";
  createdTime: number;
  modifiedTime: number;
}

// ----------------------------- CONTENT -----------------------------

interface CreateTeamV0 {
  type: "createTeam";
  ownerName: string;
}

interface InviteUserV0 {
  type: "inviteUser";
  inviteeUsername: string;
}

interface InviteCollaboratorV0 {
  type: "inviteCollaborator";
  inviteeUsername: string;
}

interface InviteAcceptedV0 {
  type: "inviteAccepted";
  inviteeUsername: string;
}

interface TeamAuditActionV0 {
  action: CreateTeamV0 | InviteUserV0 | InviteCollaboratorV0 | InviteAcceptedV0;
  username: string;
  timestamp: number;
}

type TeamAuditContentV0 = TeamAuditActionV0[];

const metaMigrations = [];
const contentMigrations = [];

export {
  TeamAuditMetaV0 as TeamAuditMeta,
  TeamAuditContentV0 as TeamAuditContent,
  TeamAuditActionV0 as TeamAuditAction,
  metaMigrations as TeamAuditMetaMigrations,
  contentMigrations as TeamAuditContentMigrations,
};
