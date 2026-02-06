import type { ExtensionKind, Stage } from "../types";

export const stageKinds: Record<Stage, ExtensionKind> = {
  stores: "store",
  loaders: "loader",
  validators: "validator",
  contextBuilders: "contextBuilder",
  senders: "sender",
  ui: "ui",
};
