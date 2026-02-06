import { describe, expect, test } from "bun:test";
import type { Event } from "@core/event";
import { createEventStore, getFactsFromEvent } from "./event-store";

const createTestEvent = (overrides: Partial<Event> = {}): Event => ({
  id: "event-1",
  worldId: "world-1",
  timestamp: 5,
  title: "Test Event",
  participants: ["alice", "bob"],
  visibility: "public",
  ...overrides,
});

describe("EventStore", () => {
  describe("Zero - empty store", () => {
    test("getAll returns empty array", () => {
      const store = createEventStore();
      expect(store.getAll()).toEqual([]);
    });

    test("getById returns undefined for unknown id", () => {
      const store = createEventStore();
      expect(store.getById("unknown")).toBeUndefined();
    });

    test("getByParticipant returns empty array", () => {
      const store = createEventStore();
      expect(store.getByParticipant("anyone")).toEqual([]);
    });

    test("getByTimestamp returns empty array", () => {
      const store = createEventStore();
      expect(store.getByTimestamp(5)).toEqual([]);
    });

    test("getByLocation returns empty array", () => {
      const store = createEventStore();
      expect(store.getByLocation("anywhere")).toEqual([]);
    });
  });

  describe("One - single event", () => {
    test("add event and retrieve by id", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getById("event-1")).toEqual(event);
    });

    test("getAll returns the single event", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getAll()).toEqual([event]);
    });

    test("getByParticipant finds event where entity participated", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getByParticipant("alice")).toEqual([event]);
    });

    test("getByParticipant returns empty for non-participant", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getByParticipant("charlie")).toEqual([]);
    });

    test("getByTimestamp finds event at exact timestamp", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getByTimestamp(5)).toEqual([event]);
    });

    test("getByTimestamp returns empty for different timestamp", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getByTimestamp(10)).toEqual([]);
    });

    test("getByLocation finds event at location", () => {
      const store = createEventStore();
      const event = createTestEvent({ location: "throne-room" });
      store.add(event);
      expect(store.getByLocation("throne-room")).toEqual([event]);
    });

    test("getByLocation returns empty for different location", () => {
      const store = createEventStore();
      const event = createTestEvent({ location: "throne-room" });
      store.add(event);
      expect(store.getByLocation("garden")).toEqual([]);
    });
  });

  describe("Many - multiple events", () => {
    test("getAll returns all events", () => {
      const store = createEventStore();
      const event1 = createTestEvent({ id: "e1" });
      const event2 = createTestEvent({ id: "e2", timestamp: 10 });
      store.add(event1);
      store.add(event2);
      expect(store.getAll()).toEqual([event1, event2]);
    });

    test("getByParticipant returns only events with that participant", () => {
      const store = createEventStore();
      const event1 = createTestEvent({ id: "e1", participants: ["alice"] });
      const event2 = createTestEvent({ id: "e2", participants: ["bob"] });
      store.add(event1);
      store.add(event2);
      expect(store.getByParticipant("alice")).toEqual([event1]);
    });

    test("participant in multiple events returns all their events", () => {
      const store = createEventStore();
      const event1 = createTestEvent({ id: "e1", participants: ["alice"] });
      const event2 = createTestEvent({
        id: "e2",
        participants: ["alice", "bob"],
      });
      const event3 = createTestEvent({ id: "e3", participants: ["bob"] });
      store.add(event1);
      store.add(event2);
      store.add(event3);
      expect(store.getByParticipant("alice")).toEqual([event1, event2]);
    });

    test("getByTimestamp returns all events at that timestamp", () => {
      const store = createEventStore();
      const event1 = createTestEvent({ id: "e1", timestamp: 5 });
      const event2 = createTestEvent({ id: "e2", timestamp: 5 });
      const event3 = createTestEvent({ id: "e3", timestamp: 10 });
      store.add(event1);
      store.add(event2);
      store.add(event3);
      expect(store.getByTimestamp(5)).toEqual([event1, event2]);
    });

    test("getByLocation returns all events at that location", () => {
      const store = createEventStore();
      const event1 = createTestEvent({ id: "e1", location: "throne-room" });
      const event2 = createTestEvent({ id: "e2", location: "throne-room" });
      const event3 = createTestEvent({ id: "e3", location: "garden" });
      store.add(event1);
      store.add(event2);
      store.add(event3);
      expect(store.getByLocation("throne-room")).toEqual([event1, event2]);
    });
  });

  describe("Boundary cases", () => {
    test("event with no location can be added and queried", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      expect(store.getById("event-1")).toEqual(event);
      expect(store.getByLocation("anywhere")).toEqual([]);
    });

    test("event at timestamp 0 works correctly", () => {
      const store = createEventStore();
      const event = createTestEvent({ timestamp: 0 });
      store.add(event);
      expect(store.getByTimestamp(0)).toEqual([event]);
    });

    test("multiple participants in same event all find it", () => {
      const store = createEventStore();
      const event = createTestEvent({
        participants: ["alice", "bob", "charlie"],
      });
      store.add(event);
      expect(store.getByParticipant("alice")).toEqual([event]);
      expect(store.getByParticipant("bob")).toEqual([event]);
      expect(store.getByParticipant("charlie")).toEqual([event]);
    });
  });

  describe("Interface - immutability", () => {
    test("getAll returns a copy, not the internal array", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      const result = store.getAll();
      result.push(createTestEvent({ id: "hacked" }));
      expect(store.getAll()).toHaveLength(1);
    });

    test("getByParticipant returns a copy", () => {
      const store = createEventStore();
      const event = createTestEvent();
      store.add(event);
      const result = store.getByParticipant("alice");
      result.push(createTestEvent({ id: "hacked" }));
      expect(store.getByParticipant("alice")).toHaveLength(1);
    });
  });

  describe("Visibility filtering", () => {
    test("getByVisibility returns only events with matching visibility", () => {
      const store = createEventStore();
      const privateEvent = createTestEvent({ id: "e1", visibility: "private" });
      const publicEvent = createTestEvent({ id: "e2", visibility: "public" });
      store.add(privateEvent);
      store.add(publicEvent);
      expect(store.getByVisibility("private")).toEqual([privateEvent]);
      expect(store.getByVisibility("public")).toEqual([publicEvent]);
    });

    test("private events returned for private query", () => {
      const store = createEventStore();
      const event = createTestEvent({ visibility: "private" });
      store.add(event);
      expect(store.getByVisibility("private")).toEqual([event]);
    });

    test("public events returned for public query", () => {
      const store = createEventStore();
      const event = createTestEvent({ visibility: "public" });
      store.add(event);
      expect(store.getByVisibility("public")).toEqual([event]);
    });
  });

  describe("Fact generation from events", () => {
    test("getFactsFromEvent returns empty array for event without outcomes", () => {
      const event = createTestEvent();
      expect(getFactsFromEvent(event)).toEqual([]);
    });

    test("getFactsFromEvent returns facts with validFrom set to event timestamp", () => {
      const event = createTestEvent({
        timestamp: 5,
        outcomes: [
          {
            worldId: "world-1",
            subject: "alice",
            property: "title",
            value: "Queen",
          },
        ],
      });
      const facts = getFactsFromEvent(event);
      expect(facts).toHaveLength(1);
      expect(facts[0]?.validFrom).toBe(5);
    });

    test("getFactsFromEvent preserves existing validFrom if specified", () => {
      const event = createTestEvent({
        timestamp: 5,
        outcomes: [
          {
            worldId: "world-1",
            subject: "alice",
            property: "title",
            value: "Queen",
            validFrom: 3,
          },
        ],
      });
      const facts = getFactsFromEvent(event);
      expect(facts[0]?.validFrom).toBe(3);
    });

    test("getFactsFromEvent handles multiple outcomes", () => {
      const event = createTestEvent({
        timestamp: 10,
        outcomes: [
          {
            worldId: "world-1",
            subject: "alice",
            property: "title",
            value: "Queen",
          },
          {
            worldId: "world-1",
            subject: "bob",
            property: "status",
            value: "dead",
          },
        ],
      });
      const facts = getFactsFromEvent(event);
      expect(facts).toHaveLength(2);
      expect(facts[0]?.validFrom).toBe(10);
      expect(facts[1]?.validFrom).toBe(10);
    });
  });
});
