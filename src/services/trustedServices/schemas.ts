import { JSONSchemaType } from "ajv";
import { UiTemplate } from "./interfaces";

const UiTemplateSchema: JSONSchemaType<UiTemplate> = {
  type: "object",
  required: ["trustedService", "uiElements"],
  additionalProperties: false,
  properties: {
    trustedService: { type: "string" },
    uiElements: {
      type: "array",
      default: [],
      items: {
        anyOf: [
          {
            type: "object",
            required: ["apiEndpoint", "uiParams", "placement"],
            additionalProperties: false,
            properties: {
              apiEndpoint: { type: "string" },
              uiParams: {
                type: "object",
                required: ["icon", "tooltip"],
                additionalProperties: false,
                properties: {
                  tag: { type: "string", nullable: true },
                  value: { type: "string", nullable: true },
                  icon: { type: "string" },
                  tooltip: { type: "string" },
                },
              },
              placement: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["curate", "annotate"],
                },
              },
            },
          },
        ],
      },
    },
  },
};

export { UiTemplateSchema };
