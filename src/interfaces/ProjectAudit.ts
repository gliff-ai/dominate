import { BaseMeta } from "./shared";
import { Plugin } from "@/plugins";

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

interface CreateProjectV0 {
  type: "createProject";
  projectName: string;
  description: string;
}

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

interface UserInviteAcceptedV0 {
  type: "userInviteAccepted";
  inviteeUsername: string;
}

interface InviteCollaboratorV0 {
  type: "inviteCollaborator";
  inviteeUsername: string;
}

interface CollaboratorInviteAcceptedV0 {
  type: "collaboratorInviteAccepted";
  inviteeUsername: string;
}

interface SetDefaultLabelsV0 {
  type: "setDefaultLabels";
  defaultLabels: string[];
}

interface SetRestrictLabelsV0 {
  type: "setRestrictLabels";
  restrictLabels: boolean;
}

interface SetMultiLabelV0 {
  type: "setMultiLabel";
  multiLabel: boolean;
}

interface SetPluginV0 {
  type: "setPlugin";
  plugin: {
    username?: string; // trusted-service username (i.e., email address)
    name: string; // plugin name
    type: "Javascript" | "Python" | "AI";
    url: string; // base_url for trusted-services and url for plugins
    products: "CURATE" | "ANNOTATE" | "ALL";
    enabled: boolean;
  };
}

interface DeletePluginV0 {
  type: "deletePlugin";
  plugin: {
    username?: string; // trusted-service username (i.e., email address)
    name: string; // plugin name
    type: "Javascript" | "Python" | "AI";
    url: string; // base_url for trusted-services and url for plugins
    products: "CURATE" | "ANNOTATE" | "ALL";
    enabled: boolean;
  };
}

interface CallPluginV0 {
  type: "callPlugin";
  pluginName: string;
  pluginType?: string;
  imageUid: string;
  imageMetadata?: ({
    [index: string]: string | number | boolean | string[] | undefined;
  } & {
    id?: string;
    imageName?: string;
    imageLabels?: string[];
    filterShow?: boolean;
    assignees?: string[];
    numberOfDimensions?: "2" | "3";
    dimensions?: string;
    size?: string;
  })[];
}

interface ProjectAuditActionV0 {
  action:
    | CreateProjectV0
    | UploadImageV0
    | DeleteImageV0
    | AssignImageV0
    | UnassignImageV0
    | UpdateImageLabelsV0
    | InviteUserV0
    | UserInviteAcceptedV0
    | InviteCollaboratorV0
    | CollaboratorInviteAcceptedV0
    | SetDefaultLabelsV0
    | SetRestrictLabelsV0
    | SetMultiLabelV0
    | SetPluginV0
    | DeletePluginV0
    | CallPluginV0;
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
