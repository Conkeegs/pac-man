import { App } from "../../../App.js";
import type { AbstractConstructor } from "../../../types.js";
import type { BoardObject } from "../BoardObject.js";

/**
 * A class that has the ability to create DOM event listeners in the app.
 */
export type Listenable = InstanceType<ReturnType<typeof MakeListenable<typeof BoardObject>>>;

/**
 * Gives a class the ability to create DOM event listeners in the app.
 *
 * @param Base any class
 * @returns a class that has the ability to create DOM event listeners in the app
 */
export default function MakeListenable<TBase extends AbstractConstructor<BoardObject>>(Base: TBase) {
	abstract class ListenableClass extends Base {
		/**
		 * Event listeners registered for this board object.
		 */
		_EVENT_LISTENERS: typeof App.EVENT_LISTENERS = [];

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
			for (let i = 0; i < this._EVENT_LISTENERS.length; i++) {
				const eventListenerInfo = this._EVENT_LISTENERS[i]!;

				eventListenerInfo.element.removeEventListener(eventListenerInfo.eventName, eventListenerInfo.callback);
			}

			super.delete();
		}

		/**
		 * Registers an event listener for this board object.
		 *
		 * @param eventName name of the event to register on the board object
		 * @param element HTMLElement or the window object, which will have the event registered on it
		 * @param callback function to call when event is triggered
		 */
		_addEventListener<K extends keyof HTMLElementEventMap>(
			eventName: K,
			element: HTMLElement | Window,
			callback: (event: Event) => void
		): void {
			this._EVENT_LISTENERS.push({
				eventName,
				element,
				callback,
			});

			App.addEventListenerToElement(eventName, element, callback);
		}
	}

	return ListenableClass;
}
