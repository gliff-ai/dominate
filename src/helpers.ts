import type { Annotation, Spline, BoundingBox } from "@gliff-ai/annotate";

import { evaluateBezier } from "@gliff-ai/annotate/dist/evaluateBezier";
import { GalleryTile, MetaItem } from "@/interfaces";

export function setStateIfMounted(
  newState: any,
  setStateFunc: (state: any) => void,
  isMounted: boolean
): void {
  // update state only if component is mounted
  if (isMounted) {
    setStateFunc(newState);
  }
}

export const uniquifyFilenames = (filenames: string[]): string[] => {
  const counts = {};
  for (let i = 0; i < filenames.length; i += 1) {
    if (counts[filenames[i]] === undefined) {
      counts[filenames[i]] = 1;
    } else {
      counts[filenames[i]] += 1;
    }
    if (counts[filenames[i]] > 1) {
      const [name, extension] = filenames[i].split(".");
      filenames[i] = `${name} (${counts[filenames[i]] as number}).${extension}`;
    }
  }
  return filenames;
};

const convertBezierSpline = (spline: Spline): Spline => {
  if (spline.isBezier) {
    spline.coordinates = evaluateBezier(spline.coordinates);
  }
  return spline;
};

export const makeAnnotationsJson = (
  allnames: string[],
  tiles: GalleryTile[],
  annotations: Annotation[][][]
): string => {
  // make annotations JSON file:
  interface JSONAnnotation {
    // an individual object (or "layer") within a user's annotation of an image
    labels: string[];
    segmaskName?: string; // name of segmentation mask image (for brushstroke annotations)
    colour?: string; // colour of brushstroke in segmask image
    spline: Spline;
    boundingBox?: BoundingBox;
  }
  interface JSONImage {
    imageName: string;
    labels: string[];
    annotations: JSONAnnotation[][]; // array of array because multiple users can each create multiple annotation in the image, e.g. for different cells
  }
  const annotationsJson: JSONImage[] = allnames.map((name, i) => ({
    imageName: name,
    labels: tiles[i].imageLabels,
    annotations: annotations[i].map((annotationsObject: Annotation[], j) => {
      let maskName = allnames[i].split(".")[0];
      if (annotations[i].length > 1) {
        // numbering the segmasks by different annotators for the same image
        maskName += `_${j}`;
      }
      maskName += ".tiff";

      return annotationsObject.map((annotation) => ({
        labels: annotation.labels,
        segmaskName: annotation.brushStrokes.length > 0 ? maskName : undefined,
        colour: annotation.brushStrokes[0]?.brush.color, // colour of this annotation in the segmask image
        spline: convertBezierSpline(annotation.spline),
        boundingBox: annotation.boundingBox,
      }));
    }),
  }));

  return JSON.stringify(annotationsJson);
};

export function convertGalleryToMetadata(gallery: GalleryTile[]): MetaItem[] {
  /*  convert Gallery object into Metadata object.
      excluded keys: imageUID, AnnotationUID, auditUID, annotationComplete. */

  return gallery.map(
    ({ id, thumbnail, assignees = [], imageLabels = [], fileInfo }) =>
      // keys included in the metada object (and displayed in CURATE).
      ({
        id,
        thumbnail,
        assignees,
        imageLabels,
        ...fileInfo,
        imageName: fileInfo.fileName, // CURATE expects imageName rather than fileName.
      })
  );
}

export interface MetaItemWithId extends MetaItem {
  id: string;
}

// List of keys that CANNOT be updated by plugins.
// NOTE: a disallowed list is used because plugins should be able to add any new field.
const EXCLUDED_KEYS = [
  "id",
  "assignees",
  "thumbnail",
  "imageUID",
  "annotationUID",
  "auditUID",
  "annotationComplete",
  "width",
  "height",
  "num_slices",
  "fileName",
];

export function convertMetadataToGalleryTiles(
  metadata: MetaItemWithId[],
  excludedKeys: string[] = EXCLUDED_KEYS
): { [id: string]: Partial<GalleryTile> } {
  /*  Convert Matadata object to an object that maps IDs to GalleryTile objects.
      The returned map can be used to update the Gallery object.
      Any extra field that should never be overridden can be added to EXCLUDED_KEYS. */

  const newTiles = {};
  metadata.forEach(({ id, ...otherKeys }) => {
    // delete excluded key-value pairs
    for (const key of excludedKeys) delete otherKeys[key];

    // convert matadata item to gallery tile
    const { imageLabels, ...fileInfo } = otherKeys;
    newTiles[id] = { imageLabels, fileInfo };
  });
  return newTiles;
}
