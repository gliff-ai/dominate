import { JSONSchemaType } from "ajv";
import { UiTemplate } from "../../services/trustedServices/interfaces";

const UiTemplateSchema: JSONSchemaType<UiTemplate> = {
  type: "object",
  required: ["ui"],
  additionalProperties: false,
  properties: {
    ui: {
      type: "object",
      required: ["button"],
      additionalProperties: false,
      properties: {
        button: {
          type: "object",
          required: ["tooltip"],
          additionalProperties: true,
          properties: {
            name: { type: "string", nullable: true },
            tooltip: { type: "string" },
          },
        },
      },
    },
  },
};

export { UiTemplateSchema };
