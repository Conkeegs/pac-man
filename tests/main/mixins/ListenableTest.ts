import { App } from "../../../src/main/app/App.js";
import { BoardObject } from "../../../src/main/board/boardobject/BoardObject.js";
import MakeListenable from "../../../src/main/mixins/Listenable.js";
import Test from "../../base/Base.js";

/**
 * Tests functionality of `Listenable` instances.
 */
export default class ListenableTest extends Test {
	/**
	 * Test that listenables are created correctly.
	 */
	public createListenableTest(): void {
		const listenable = new (class extends MakeListenable(BoardObject) {})("test-listenable", 0, 0);

		this.assertTrue(App.getInstance().getListenableGameElementIds().has(listenable.getUniqueId()));
	}

	/**
	 * Test that listenables can be deleted correctly.
	 */
	public deleteTest(): void {
		const listenable = new (class extends MakeListenable(BoardObject) {
			constructor() {
				super("test listenable", 0, 0);
			}
		})();
		let changedValue = 1;
		const listenableGameElementIds = App.getInstance().getListenableGameElementIds();

		listenable._addEventListener("keydown", () => {
			changedValue++;
		});
		listenable._addEventListener("keydown", () => {
			changedValue++;
		});

		this.assertTrue(listenableGameElementIds.has(listenable.getUniqueId()));
		this.assertStrictlyEqual(1, changedValue);
		this.assertArrayLength(2, listenable._EVENT_LISTENERS);

		listenable.getElement().dispatchEvent(new KeyboardEvent("keydown"));

		// assert event listener works
		this.assertStrictlyEqual(3, changedValue);

		listenable.delete();
		listenable.getElement().dispatchEvent(new KeyboardEvent("keydown"));

		// event listener should not be registered anymore so it should not increment "changedValue"
		this.assertStrictlyEqual(3, changedValue);
		this.assertArrayLength(0, listenable._EVENT_LISTENERS);
		this.assertFalse(listenableGameElementIds.has(listenable.getUniqueId()));
	}

	/**
	 * Test that listenables register event listeners correctly.
	 */
	public addEventListenerTest(): void {
		const listenable = new (class extends MakeListenable(BoardObject) {
			constructor() {
				super("test listenable", 0, 0);
			}
		})();
		let changedValue = 1;

		listenable._addEventListener("keydown", () => {
			changedValue++;
		});

		this.assertStrictlyEqual(1, changedValue);
		this.assertArrayLength(1, listenable._EVENT_LISTENERS);

		listenable.getElement().dispatchEvent(new KeyboardEvent("keydown"));

		// assert event listener works
		this.assertStrictlyEqual(2, changedValue);
	}
}
