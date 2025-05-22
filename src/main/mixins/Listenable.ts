import { App, type EventListenerData } from "../app/App.js";
import type { GameElement } from "../gameelement/GameElement.js";
import type { AbstractConstructor } from "../types.js";

/**
 * A class that has the ability to create DOM event listeners in the app.
 */
export type Listenable = InstanceType<ReturnType<typeof MakeListenable<typeof GameElement>>>;

/**
 * Gives a class the ability to create DOM event listeners in the app.
 *
 * @param Base any class
 * @returns a class that has the ability to create DOM event listeners in the app
 */
export default function MakeListenable<TBase extends AbstractConstructor<GameElement>>(Base: TBase) {
	abstract class ListenableClass extends Base {
		/**
		 * Event listeners registered for this game element.
		 */
		_EVENT_LISTENERS: EventListenerData[] = [];

		/**
		 * Creates a `ListenableClass` instance.
		 *
		 * @param args arguments passed to the class's constructor
		 */
		constructor(...args: any[]) {
			super(...args);
		}

		/**
		 * Deletes this listenable and makes sure that all of its event listeners are removed.
		 */
		public override delete(): void {
			const eventListeners = this._EVENT_LISTENERS;

			for (let i = 0; i < eventListeners.length; i++) {
				const eventListenerInfo = eventListeners[i]!;

				eventListenerInfo.element.removeEventListener(eventListenerInfo.eventName, eventListenerInfo.callback);
			}

			eventListeners.length = 0;

			super.delete();
		}

		/**
		 * Registers an event listener for this game element.
		 *
		 * @param eventName name of the event to register on the game element
		 * @param callback function to call when event is triggered
		 * @param element HTMLElement or the window object, which will have the event registered on it.
		 * defaults to the game element's DOM element
		 */
		_addEventListener<K extends keyof HTMLElementEventMap>(
			eventName: K,
			callback: (event: Event) => void,
			element?: HTMLElement | Window
		): void {
			element = element ?? this.getElement();

			this._EVENT_LISTENERS.push({
				eventName,
				element,
				callback,
			});

			App.getInstance().addEventListenerToElement(eventName, element, callback);
		}
	}

	return ListenableClass;
}
