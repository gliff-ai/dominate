import { BaseMeta } from "./shared";

// ----------------------------- META -----------------------------

interface ProjectAuditMetaV0 extends BaseMeta {
  meta_version: 0;
  content_version: 0;
  type: "gliff.projectAudit";
  name: string; // should be the same as the project name
  createdTime: number;
  modifiedTime: number;
  deletedTime: number | null;
  galleryUID: string;
}

// ----------------------------- CONTENT -----------------------------

interface UploadImageV0 {
  type: "uploadImage";
  imageName: string;
  imageUid: string;
}

interface DeleteImageV0 {
  type: "deleteImage";
  imageName: string;
  imageUid: string;
}

interface AssignImageV0 {
  type: "assignImage";
  imageName: string;
  imageUid: string;
  assigneeUsername: string;
}

interface UnassignImageV0 {
  type: "unassignImage";
  imageName: string;
  imageUid: string;
  assigneeUsername: string;
}

interface UpdateImageLabelsV0 {
  type: "updateImageLabels";
  imageName: string;
  imageUid: string;
  labels: string[];
}

interface InviteUserV0 {
  type: "inviteUser";
  inviteeUsername: string;
}

interface InviteAcceptedV0 {
  type: "inviteAccepted";
  inviteeUsername: string;
}

interface SetDefaultLabelsV0 {
  type: "setDefaultLabels";
  defaultLabels: string[];
}

interface SetRestrictToDefaultLabelsV0 {
  type: "setRestrictToDefaultLabels";
  restrict: boolean;
}

interface SetMultiLabelV0 {
  type: "setMultiLabel";
  multiLabel: boolean;
}

interface ProjectAuditActionV0 {
  action:
    | UploadImageV0
    | DeleteImageV0
    | AssignImageV0
    | UpdateImageLabelsV0
    | InviteUserV0
    | InviteAcceptedV0
    | SetDefaultLabelsV0
    | SetRestrictToDefaultLabelsV0
    | SetMultiLabelV0;
  username: string;
  timestamp: number;
}

type ProjectAuditContentV0 = ProjectAuditActionV0[];

const metaMigrations = [];
const contentMigrations = [];

export {
  ProjectAuditMetaV0 as ProjectAuditMeta,
  ProjectAuditContentV0 as ProjectAuditContent,
  ProjectAuditActionV0 as ProjectAuditAction,
  metaMigrations as ProjectAuditMetaMigrations,
  contentMigrations as ProjectAuditContentMigrations,
};
