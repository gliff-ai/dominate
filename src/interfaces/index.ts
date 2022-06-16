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
import { FileInfo, BaseMeta, DemoMetadata } from "./shared";

import { MetaItem } from "@gliff-ai/curate";

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

export type {
  BaseMeta,
  GalleryMeta,
  GalleryContent,
  GalleryTile,
  ImageMeta,
  AnnotationMeta,
  AuditMeta,
  FileInfo,
  MetaItem,
  ImageBitmapBlob,
  Channels,
  Slices,
  Metadata,
  DemoMetadata,
};

export { migrations };
