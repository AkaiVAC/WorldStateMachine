import type { Event, Fact } from "../../core-types";

export type SceneContext = {
    worldId: string;
    timestamp: number;
    entities: string[];
    facts: Fact[];
    events: Event[];
};

export type SendResult = {
    response: string;
    metadata?: Record<string, unknown>;
};

export type Sender = {
    name: string;
    send: (context: SceneContext, prompt: string) => Promise<SendResult>;
};
