import type { Status } from "../types";

export const isExplicitlyOff = (status: Status) => status === "off";

export const getNeedsStatus = (dependencies: string[]) =>
  `needs:${dependencies.join(",")}` as Status;
