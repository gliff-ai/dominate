import { makeAnnotationsJson, uniquifyFilenames } from "@/helpers";
import {
  names,
  collectionContent,
  annotations,
  expectedOutput,
} from "./makeAnnotationsJsonTestData";

describe("Download dataset annotations", () => {
  beforeEach(() => {});

  test("uniquifyFilenames", () => {
    const inputNames = [
      "orange.jpg",
      "orange.jpg",
      "orange.jpg",
      "pear.png",
      "grape.tiff",
      "grape.tiff",
    ];
    const uniquifiedNames = [
      "orange.jpg",
      "orange (2).jpg",
      "orange (3).jpg",
      "pear.png",
      "grape.tiff",
      "grape (2).tiff",
    ];
    expect(uniquifyFilenames(inputNames)).toEqual(uniquifiedNames);
  });

  test("makeAnnotationsJson", () => {
    const outputJson = makeAnnotationsJson(
      names,
      collectionContent,
      annotations
    );
    expect(JSON.parse(outputJson)).toEqual(expectedOutput);
  });
});
