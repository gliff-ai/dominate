import { ImageFileInfo } from "@gliff-ai/upload";
import { ImageMeta } from "@/store/interfaces";

function getImageMetaFromImageFileInfo(
  imageFileInfo: ImageFileInfo
): ImageMeta {
  return {
    imageName: imageFileInfo.fileName,
    width: imageFileInfo.width,
    height: imageFileInfo.height,
    size: imageFileInfo.size,
    num_channels: imageFileInfo.num_channels,
    num_slices: imageFileInfo.num_slices,
    resolution_x: imageFileInfo.resolution_x,
    resolution_y: imageFileInfo.resolution_y,
    resolution_z: imageFileInfo.resolution_z,
    content_hash: imageFileInfo.content_hash,
  };
}

function getImageFileInfoFromImageMeta(
  imageUid: string,
  imageMeta: ImageMeta
): ImageFileInfo {
  return new ImageFileInfo({
    fileName: imageUid,
    ...imageMeta,
  });
}

function stringifySlices(slicesData: ImageBitmap[][]): string {
  // Convert image data from ImageBitmap[][] to string of base64-ecoded images.
  const slicesBase64: string[][] = [];

  const { width, height } = slicesData[0][0];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  canvas.width = width;
  canvas.height = height;

  for (let i = 0; i < slicesData.length; i += 1) {
    slicesBase64[i] = [];
    for (let j = 0; j < slicesData[i].length; j += 1) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(slicesData[i][j], 0, 0, width, height);
      const uri = canvas.toDataURL("image/png", 1); // format, quality (1=max)
      const b64 = uri.replace("data:image/png;base64,", "");
      slicesBase64[i][j] = b64;
    }
  }
  return JSON.stringify(slicesBase64);
}

function convertBase64ToImageBitmap(
  base64: string,
  width: number,
  height: number
): Promise<ImageBitmap> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      createImageBitmap(image, 0, 0, width, height).then(
        (imageBitmap) => {
          resolve(imageBitmap);
        },
        (e) => {
          console.log(e);
        }
      );
    };
    image.src = `data:image/png;base64,${base64}`;
  });
}

function parseStringifiedSlices(
  stringifiedSlicesData: string,
  imageWidth: number,
  imageHeight: number
): Promise<ImageBitmap[][]> {
  // Convert image data from base64 encoded to ImageBitmap[][].
  const slicesBase64 = JSON.parse(stringifiedSlicesData) as string[][];
  const slicesBitmapPromise: Promise<ImageBitmap>[][] = [];

  for (let i = 0; i < slicesBase64.length; i += 1) {
    slicesBitmapPromise[i] = [];
    for (let j = 0; j < slicesBase64[i].length; j += 1) {
      slicesBitmapPromise[i][j] = convertBase64ToImageBitmap(
        slicesBase64[i][j],
        imageWidth,
        imageHeight
      );
    }
  }

  // Resolve some promises
  const halfUnwrapped: Promise<ImageBitmap[]>[] = slicesBitmapPromise.map(
    async (sliceChannels) => Promise.all(sliceChannels)
  );
  return new Promise((resolve) => {
    Promise.all(halfUnwrapped)
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        console.log(e);
      });
  });
}

function convertImageBitmapToUint8Array(
  slicesData: ImageBitmap[][]
): Uint8Array[][] {
  // Convert image data from type ImageBitmap[][] to Uint8Array[][].
  const array: Uint8Array[][] = [];

  const { width, height } = slicesData[0][0];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  canvas.width = width;
  canvas.height = height;

  for (let i = 0; i < slicesData.length; i += 1) {
    array[i] = [];
    for (let j = 0; j < slicesData[i].length; j += 1) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(slicesData[i][j], 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height).data;
      array[i][j] = Uint8Array.from(imageData);
    }
  }
  return array;
}

async function convertUint8ArrayToImageBitmap(
  array: Uint8Array[][],
  width: number,
  height: number
): Promise<ImageBitmap[][]> {
  // Convert image data from Uint8Array[][] to ImageBitmap[][].
  const slicesData: Promise<ImageBitmap>[][] = [];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  canvas.width = width;
  canvas.height = height;
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < array.length; i += 1) {
    slicesData[i] = [];
    for (let j = 0; j < array[i].length; j += 1) {
      imageData.data.set(array[i][j]);
      slicesData[i][j] = createImageBitmap(imageData, 0, 0, width, height);
    }
  }
  // Resolve some promises
  const halfUnwrapped: Promise<ImageBitmap[]>[] = slicesData.map(
    async (channels) => Promise.all(channels)
  );

  return new Promise((resolve) => {
    Promise.all(halfUnwrapped)
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        console.log(e);
      });
  });
}

export {
  stringifySlices,
  parseStringifiedSlices,
  convertImageBitmapToUint8Array,
  convertUint8ArrayToImageBitmap,
  getImageMetaFromImageFileInfo,
  getImageFileInfoFromImageMeta,
};
