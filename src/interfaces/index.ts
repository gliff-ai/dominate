import { MetaItem } from "@gliff-ai/curate";
import {
  GalleryMeta,
  GalleryContent,
  GalleryTile,
  GalleryMetaMigrations,
  GalleryContentMigrations,
} from "./Gallery";
import {
  ImageMeta,
  ImageMetaMigrations,
  ImageContentMigrations,
} from "./Image";
import {
  AnnotationMeta,
  AnnotationMetaMigrations,
  AnnotationContentMigrations,
} from "./Annotation";
import {
  AuditMeta,
  AuditMetaMigrations,
  AuditContentMigrations,
} from "./Audit";
import {
  ProjectAuditMeta,
  ProjectAuditContent,
  ProjectAuditAction,
  ProjectAuditMetaMigrations,
  ProjectAuditContentMigrations,
} from "./ProjectAudit";
import { FileInfo, BaseMeta, DemoMetadata } from "./shared";

type ImageBitmapBlob = ImageBitmap;
type Channels = ImageBitmapBlob[];
type Slices = Channels[];

type Metadata = MetaItem[];

const migrations = {};
migrations["gliff.gallery.meta"] = GalleryMetaMigrations;
migrations["gliff.gallery.content"] = GalleryContentMigrations;
migrations["gliff.image.meta"] = ImageMetaMigrations;
migrations["gliff.image.content"] = ImageContentMigrations;
migrations["gliff.annotation.meta"] = AnnotationMetaMigrations;
migrations["gliff.annotation.content"] = AnnotationContentMigrations;
migrations["gliff.audit.meta"] = AuditMetaMigrations;
migrations["gliff.audit.content"] = AuditContentMigrations;
migrations["gliff.projectAudit.meta"] = ProjectAuditMetaMigrations;
migrations["gliff.projectAudit.content"] = ProjectAuditContentMigrations;

export type {
  BaseMeta,
  GalleryMeta,
  GalleryContent,
  GalleryTile,
  ImageMeta,
  AnnotationMeta,
  AuditMeta,
  ProjectAuditMeta,
  ProjectAuditContent,
  ProjectAuditAction,
  FileInfo,
  MetaItem,
  ImageBitmapBlob,
  Channels,
  Slices,
  Metadata,
  DemoMetadata,
};

export { migrations };
