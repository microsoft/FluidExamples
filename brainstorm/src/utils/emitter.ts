/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Listenable, Listeners, Off } from "@fluidframework/core-interfaces";

/**
 * Interface for an event emitter that can emit typed events to subscribed listeners.
 */
interface IEmitter<TListeners extends Listeners<TListeners>> {
	/**
	 * Emits an event with the specified name and arguments, notifying all subscribers by calling their registered listener functions.
	 * @param eventName - The name of the event to fire
	 * @param args - The arguments passed to the event listener functions
	 */
	emit<K extends keyof Listeners<TListeners>>(
		eventName: K,
		...args: Parameters<TListeners[K]>
	): void;

	/**
	 * Emits an event with the specified name and arguments, notifying all subscribers by calling their registered listener functions.
	 * It also collects the return values of all listeners into an array.
	 *
	 * @remarks
	 * Warning: This method should be used with caution. It deviates from the standard event-based integration pattern as creates substantial coupling between the emitter and its listeners.
	 * For the majority of use-cases it is recommended to use the standard {@link IEmitter.emit} functionality.
	 * @param eventName - The name of the event to fire
	 * @param args - The arguments passed to the event listener functions
	 * @returns An array of the return values of each listener, preserving the order listeners were called.
	 */
	emitAndCollect<K extends keyof Listeners<TListeners>>(
		eventName: K,
		...args: Parameters<TListeners[K]>
	): ReturnType<TListeners[K]>[];
}

/**
 * Called when the last listener for a given `eventName` is removed.
 * @remarks
 * Useful for determining when to clean up resources related to detecting when the event might occurs.
 */
type NoListenersCallback<TListeners extends object> = (
	eventName: keyof Listeners<TListeners>,
) => void;

/**
 * Allows querying if an object has listeners.
 */
interface HasListeners<TListeners extends Listeners<TListeners>> {
	/**
	 * Determines whether or not any listeners are registered for the specified event name.
	 *
	 * @remarks
	 * If no event name is given, checks if *any* listeners are registered.
	 * This can be used to know when its safe to cleanup data-structures which only exist to fire events for their listeners.
	 */
	hasListeners(eventName?: keyof Listeners<TListeners>): boolean;
}

/**
 * Subset of Map interface including only the `get` and `set` methods.
 */
interface MapGetSet<K, V> {
	get(key: K): V | undefined;
	set(key: K, value: V): void;
}

/**
 * Retrieve a value from a map with the given key, or create a new entry if the key is not in the map.
 * @param map - The map to query/update
 * @param key - The key to lookup in the map
 * @param defaultValue - a function which returns a default value. This is called and used to set an initial value for the given key in the map if none exists
 * @returns either the existing value for the given key, or the newly-created value (the result of `defaultValue`)
 */
function getOrCreate<K, V>(map: MapGetSet<K, V>, key: K, defaultValue: (key: K) => V): V {
	let value = map.get(key);
	if (value === undefined) {
		value = defaultValue(key);
		map.set(key, value);
	}
	return value;
}

/**
 * Provides an API for subscribing to and listening to events.
 *
 * @remarks Classes wishing to emit events may either extend this class, compose over it, or expose it as a property of type {@link @fluidframework/core-interfaces#Listenable}.
 *
 * @example Extending this class
 *
 * ```typescript
 * interface MyEvents {
 * 	loaded: () => void;
 * 	computed: () => number;
 * }
 *
 * class MyInheritanceClass extends EventEmitter<MyEvents> {
 * 	private load() {
 * 		this.emit("loaded");
 * 		const results: number[] = this.emitAndCollect("computed");
 * 	}
 * }
 * ```
 *
 * @example Composing over this class
 *
 * ```typescript
 * class MyCompositionClass implements Listenable<MyEvents> {
 * 	private readonly events = createEmitter<MyEvents>();
 *
 * 	private load() {
 * 		this.events.emit("loaded");
 * 		const results: number[] = this.events.emitAndCollect("computed");
 * 	}
 *
 * 	public on<K extends keyof MyEvents>(eventName: K, listener: MyEvents[K]): () => void {
 * 		return this.events.on(eventName, listener);
 * 	}
 * }
 * ```
 *
 * @example Exposing this class as a property
 *
 * ```typescript
 * class MyExposingClass {
 * 	private readonly _events = createEmitter<MyEvents>();
 * 	public readonly events: Listenable<MyEvents> = this._events;
 *
 * 	private load() {
 * 		this._events.emit("loaded");
 * 		const results: number[] = this._events.emitAndCollect("computed");
 * 	}
 * }
 * ```
 */
class CustomEventEmitter<TListeners extends Listeners<TListeners>>
	implements Listenable<TListeners>, HasListeners<TListeners>
{
	protected readonly listeners = new Map<
		keyof TListeners,
		Set<(...args: any[]) => TListeners[keyof TListeners]>
	>();

	// Because this is protected and not public, calling this externally (not from a subclass) makes sending events to the constructed instance impossible.
	// Instead, use the static `create` function to get an instance which allows emitting events.
	protected constructor(private readonly noListeners?: NoListenersCallback<TListeners>) {}

	protected emit<K extends keyof TListeners>(
		eventName: K,
		...args: Parameters<TListeners[K]>
	): void {
		const listeners = this.listeners.get(eventName);
		if (listeners !== undefined) {
			// Current tsc (5.4.5) cannot spread `args` into `listener()`.
			const argArray: unknown[] = args;
			// This explicitly copies listeners so that new listeners added during this call to emit will not receive this event.
			for (const listener of [...listeners]) {
				// If listener has been unsubscribed while invoking other listeners, skip it.
				if (listeners.has(listener)) {
					listener(...argArray);
				}
			}
		}
	}

	protected emitAndCollect<K extends keyof TListeners>(
		eventName: K,
		...args: Parameters<TListeners[K]>
	): ReturnType<TListeners[K]>[] {
		const listeners = this.listeners.get(eventName);
		if (listeners !== undefined) {
			const argArray: unknown[] = args;
			const resultArray: ReturnType<TListeners[K]>[] = [];
			for (const listener of [...listeners.values()]) {
				resultArray.push(listener(...argArray));
			}
			return resultArray;
		}
		return [];
	}

	public on<K extends keyof Listeners<TListeners>>(eventName: K, listener: TListeners[K]): Off {
		const listeners = getOrCreate(this.listeners, eventName, () => new Set());
		if (listeners.has(listener)) {
			const eventDescription =
				typeof eventName === "symbol"
					? eventName.description
					: String(eventName.toString());

			throw new Error(
				`Attempted to register the same listener object twice for event ${eventDescription}`,
			);
		}
		listeners.add(listener);
		return () => this.off(eventName, listener);
	}

	public off<K extends keyof Listeners<TListeners>>(eventName: K, listener: TListeners[K]): void {
		const listeners = this.listeners.get(eventName);
		if (listeners?.delete(listener) === true && listeners.size === 0) {
			this.listeners.delete(eventName);
			this.noListeners?.(eventName);
		}
	}

	public hasListeners(eventName?: keyof TListeners): boolean {
		if (eventName === undefined) {
			return this.listeners.size > 0;
		}
		return this.listeners.has(eventName);
	}
}

/**
 * This class exposes the constructor and the `emit` method of `EventEmitter`, elevating them from protected to public
 */
class ComposableEventEmitter<TListeners extends Listeners<TListeners>>
	extends CustomEventEmitter<TListeners>
	implements IEmitter<TListeners>
{
	public constructor(noListeners?: NoListenersCallback<TListeners>) {
		super(noListeners);
	}

	public override emit<K extends keyof TListeners>(
		eventName: K,
		...args: Parameters<TListeners[K]>
	): void {
		return super.emit(eventName, ...args);
	}

	public override emitAndCollect<K extends keyof TListeners>(
		eventName: K,
		...args: Parameters<TListeners[K]>
	): ReturnType<TListeners[K]>[] {
		return super.emitAndCollect(eventName, ...args);
	}
}

/**
 * Create a {@link @fluidframework/core-interfaces#Listenable} that can be instructed to emit events via the {@link @fluidframework/core-interfaces#IEmitter} interface.
 *
 * A class can delegate handling {@link @fluidframework/core-interfaces#Listenable} to the returned value while using it to emit the events.
 * See also CustomEventEmitter which be used as a base class to implement {@link @fluidframework/core-interfaces#Listenable} via extension.
 * @example Forwarding events to the emitter
 * ```typescript
 * interface MyEvents {
 * 	loaded(): void;
 * }
 *
 * class MyClass implements Listenable<MyEvents> {
 * 	private readonly events = createEmitter<MyEvents>();
 *
 * 	private load(): void {
 * 		this.events.emit("loaded");
 * 	}
 *
 * 	public on<K extends keyof MyEvents>(eventName: K, listener: MyEvents[K]): Off {
 * 		return this.events.on(eventName, listener);
 * 	}
 *
 * 	public off<K extends keyof MyEvents>(eventName: K, listener: MyEvents[K]): void {
 * 		return this.events.off(eventName, listener);
 * 	}
 * }
 * ```
 */
export function createEmitter<TListeners extends object>(
	noListeners?: NoListenersCallback<TListeners>,
): Listenable<TListeners> & IEmitter<TListeners> & HasListeners<TListeners> {
	return new ComposableEventEmitter<TListeners>(noListeners);
}
