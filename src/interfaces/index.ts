import {
  GalleryMeta,
  GalleryContent,
  GalleryTile,
  GalleryMigrations,
} from "./Gallery";
import { ImageMeta, ImageMigrations } from "./Image";
import { AnnotationMeta, AnnotationMigrations } from "./Annotation";
import { FileInfo } from "./shared";

const migrations = {};
migrations["gliff.gallery"] = GalleryMigrations;
migrations["gliff.image"] = ImageMigrations;
migrations["gliff.annotation"] = AnnotationMigrations;

export {
  GalleryMeta,
  GalleryContent,
  GalleryTile,
  ImageMeta,
  AnnotationMeta,
  FileInfo,
  migrations,
};
