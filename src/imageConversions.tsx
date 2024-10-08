import { DemoMetadata, FileInfo } from "./interfaces";

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

function makeThumbnail(
  image: HTMLImageElement,
  width = 128,
  height = 128
): string {
  let uid = "";
  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  if (ctx) {
    try {
      ctx.drawImage(image, 0, 0, width, height);
      uid = canvas.toDataURL("image/png", 1); // format, quality (1=max)
    } catch (e) {
      console.log(e);
    }
  }
  return uid;
}

async function loadNonTiffImageFromURL(
  url: string,
  fileInfo: DemoMetadata["fileInfo"],
  incrementTask: () => void
): Promise<{
  imageContent: string;
  thumbnail: string;
  imageFileInfo: FileInfo;
}> {
  return new Promise(
    (
      resolve: (callbackArgs: {
        imageContent: string;
        thumbnail: string;
        imageFileInfo: FileInfo;
      }) => void
    ) => {
      const image = new Image();

      image.onload = () => {
        // extract red green and blue channels as separate imageBitmaps:
        const base64Channels: string[] = [];
        for (const colour of ["#FF0000FF", "#00FF00FF", "#0000FFFF"]) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = image.width;
          canvas.height = image.height;
          if (ctx) {
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(image, 0, 0, image.width, image.height);
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = colour;
            ctx.fillRect(0, 0, image.width, image.height);
            const uri = canvas.toDataURL("image/png", 1); // format, quality (1=max)
            const b64 = uri.replace("data:image/png;base64,", "");
            base64Channels.push(b64);
          }
        }

        resolve({
          imageContent: JSON.stringify([base64Channels]),
          thumbnail: makeThumbnail(image),
          imageFileInfo: {
            fileName: fileInfo.fileName as string,
            size: fileInfo.size as number,
            width: image.width,
            height: image.height,
            num_slices: 1,
            num_channels: 3,
            ...fileInfo,
          },
        });

        incrementTask();
        console.log(`${fileInfo.fileName as string} loaded.`);
      };

      image.onerror = function () {
        console.error("could not load image:", url);
      };

      image.crossOrigin = "*";
      image.src = url;
    }
  );
}

function convertBase64ToImageBitmap(base64: string): Promise<ImageBitmap> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      createImageBitmap(image).then(
        (imageBitmap) => resolve(imageBitmap),
        (e) => console.error(e)
      );
    };
    image.src = `data:image/png;base64,${base64}`;
  });
}

function parseStringifiedSlices(
  stringifiedSlicesData: string
): Promise<ImageBitmap[][]> {
  // Convert image data from base64 encoded to ImageBitmap[][].
  const slicesBase64 = JSON.parse(stringifiedSlicesData) as string[][];
  const slicesBitmapPromise: Promise<ImageBitmap>[][] = [];

  for (let i = 0; i < slicesBase64.length; i += 1) {
    slicesBitmapPromise[i] = [];
    for (let j = 0; j < slicesBase64[i].length; j += 1) {
      slicesBitmapPromise[i][j] = convertBase64ToImageBitmap(
        slicesBase64[i][j]
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
        console.error(e);
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
        console.error(e);
      });
  });
}

async function mixBase64Channels(channels: string[]): Promise<string> {
  // converts an [R,G,B] array of base64 images to a single RGB base64 image

  const imagePromises = channels.map(
    (c) =>
      new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();

        image.onload = () => {
          resolve(image);
        };
        image.src = `data:image/png;base64,${c}`;
      })
  );

  const b64RGB = await Promise.all(imagePromises).then((images) => {
    const canvas = document.createElement("canvas");
    canvas.width = images[0].width;
    canvas.height = images[0].height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.globalCompositeOperation = "lighter";
      images.forEach((image) => {
        ctx.drawImage(image, 0, 0, image.width, image.height);
      });
      return canvas.toDataURL().replace("data:image/png;base64,", "");
    }
    return "";
  });

  return b64RGB;
}

export {
  loadNonTiffImageFromURL,
  stringifySlices,
  parseStringifiedSlices,
  convertImageBitmapToUint8Array,
  convertUint8ArrayToImageBitmap,
  mixBase64Channels,
};
