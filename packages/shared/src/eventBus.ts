import mitt, { type Emitter } from 'mitt';

export type EventMap = Record<string, unknown>;
export type TypedEventBus<TEvents extends EventMap> = Emitter<TEvents>;

export function createEventBus<TEvents extends EventMap>() {
  return mitt<TEvents>();
}
