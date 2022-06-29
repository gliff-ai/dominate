import { JSONSchemaType } from "ajv";
import { UiTemplate } from "../../services/plugins/trustedServices/interfaces";

const UiTemplateSchema: JSONSchemaType<UiTemplate> = {
  type: "object",
  required: ["trustedService", "uiElements"],
  additionalProperties: false,
  properties: {
    trustedService: { type: "string" },
    uiElements: {
      type: "array",
      minItems: 1,
      items: {
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
    },
  },
};

export { UiTemplateSchema };
