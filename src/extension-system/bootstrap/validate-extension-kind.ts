import type { Extension, Stage } from "../types";
import { stageKinds } from "./stage-kinds";

export const validateExtensionKind = (stage: Stage, extension: Extension) => {
  const expectedKind = stageKinds[stage];
  if (extension.kind !== expectedKind) {
    throw new Error(
      `Bootstrap error: extension kind mismatch for ${stage}: ${extension.name} is ${extension.kind}.`,
    );
  }
};
