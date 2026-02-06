import type { Event, Visibility } from "@core/event";
import type { Fact } from "@core/fact";
import { defineExtension } from "@ext-system/define-extension";

export const getFactsFromEvent = (event: Event): Fact[] => {
  if (!event.outcomes) {
    return [];
  }
  return event.outcomes.map((fact) => ({
    ...fact,
    validFrom: fact.validFrom ?? event.timestamp,
  }));
};

export type EventStore = {
  add: (event: Event) => void;
  getAll: () => Event[];
  getById: (id: string) => Event | undefined;
  getByParticipant: (participantId: string) => Event[];
  getByTimestamp: (timestamp: number) => Event[];
  getByLocation: (locationId: string) => Event[];
  getByVisibility: (visibility: Visibility) => Event[];
};

export const createEventStore = (): EventStore => {
  const events: Event[] = [];

  return {
    add: (event) => {
      events.push(event);
    },
    getAll: () => [...events],
    getById: (id) => events.find((e) => e.id === id),
    getByParticipant: (participantId) =>
      events.filter((e) => e.participants.includes(participantId)),
    getByTimestamp: (timestamp) =>
      events.filter((e) => e.timestamp === timestamp),
    getByLocation: (locationId) =>
      events.filter((e) => e.location === locationId),
    getByVisibility: (visibility) =>
      events.filter((e) => e.visibility === visibility),
  };
};

export default defineExtension({
  name: "@core/memory-event-store",
  version: "1.0.0",
  kind: "store",
  activate: (context) => {
    context.eventStore = createEventStore();
    return undefined;
  },
});
