import {
  GalleryMeta,
  GalleryContent,
  GalleryTile,
  GalleryMigrations,
} from "./Gallery";
import { ImageMeta, ImageMigrations } from "./Image";
import { AnnotationMeta, AnnotationMigrations } from "./Annotation";
import { AuditMeta, AuditMigrations } from "./Audit";
import { FileInfo } from "./shared";

interface MetaItem {
  // as seen in CURATE
  [index: string]: string | string[] | boolean | number;
}

type ImageBitmapBlob = ImageBitmap;
type Channels = ImageBitmapBlob[];
type Slices = Channels[];

const migrations = {};
migrations["gliff.gallery"] = GalleryMigrations;
migrations["gliff.image"] = ImageMigrations;
migrations["gliff.annotation"] = AnnotationMigrations;
migrations["gliff.audit"] = AuditMigrations;

export type {
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
};

export { migrations };
