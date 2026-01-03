export type Hook =
    | "before-load-data"
    | "after-load-data"
    | "before-validation"
    | "after-validation"
    | "before-build-context"
    | "after-build-context"
    | "before-send-context"
    | "after-send-context"
    | "on-timeline-update"
    | "on-entity-created"
    | "on-fact-extracted"
    | "on-event-created"
    | "on-relationship-added";

export type HookContext = {
    data: unknown;
    metadata: Record<string, unknown>;
    skip?: boolean;
    augment?: unknown;
};

export type HookHandler = (ctx: HookContext) => Promise<void> | void;

export type HookManager = {
    register: (hook: Hook, handler: HookHandler, extensionName: string) => void;
    execute: (hook: Hook, context: HookContext) => Promise<HookContext>;
    getHandlers: (
        hook: Hook,
    ) => Array<{ handler: HookHandler; extension: string }>;
};

export const createHookManager = (): HookManager => {
    const handlers = new Map<
        Hook,
        Array<{ handler: HookHandler; extension: string }>
    >();

    const register = (
        hook: Hook,
        handler: HookHandler,
        extensionName: string,
    ): void => {
        if (!handlers.has(hook)) {
            handlers.set(hook, []);
        }
        handlers.get(hook)?.push({ handler, extension: extensionName });
    };

    const execute = async (
        hook: Hook,
        context: HookContext,
    ): Promise<HookContext> => {
        const hookHandlers = handlers.get(hook) || [];

        for (const { handler } of hookHandlers) {
            await handler(context);
            if (context.skip) {
                break;
            }
        }

        return context;
    };

    const getHandlers = (
        hook: Hook,
    ): Array<{ handler: HookHandler; extension: string }> => {
        return handlers.get(hook) || [];
    };

    return { register, execute, getHandlers };
};
