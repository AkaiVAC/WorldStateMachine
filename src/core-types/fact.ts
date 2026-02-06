export type Fact = {
  worldId: string;
  subject: string;
  property: string;
  value: string | number | boolean;
  validFrom?: number;
  validTo?: number;
  causedBy?: string;
};
