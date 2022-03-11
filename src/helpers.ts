import { Annotation, Spline, BoundingBox } from "@gliff-ai/annotate";
import { GalleryTile, MetaItem } from "@/store/interfaces";

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
        spline: annotation.spline,
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

export function convertMetadataToGalleryTiles(
  metadata: MetaItemWithId[],
  excludedKeys: string[] = []
): { [id: string]: Partial<GalleryTile> } {
  /*  convert Matadata object to an object that maps ids to GalleryTile objects.
      the map can be more easily used to update the Gallery object. 
      any extra field that should not be overridden can be added to excludedKeys. */

  const newTiles = {};
  metadata.forEach(
    ({
      // keys always excluded by default from the updated tile
      id,
      imageUID,
      annotationUID,
      auditUID,
      annotationComplete,
      ...mitem // all keys included
    }) => {
      // delete excluded key-value pairs
      const copyOfMitem = { ...mitem };
      for (const key of excludedKeys) delete copyOfMitem[key];

      // convert matadata item to gallery tile
      const { imageLabels, assignees, thumbnail, ...fileInfo } = copyOfMitem;
      newTiles[id] = { imageLabels, assignees, thumbnail, fileInfo };
    }
  );
  return newTiles;
}
