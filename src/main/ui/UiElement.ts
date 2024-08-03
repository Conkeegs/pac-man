import { create } from "../utils/Utils";

/**
 * Represents a base `UiElement` object.
 */
export default abstract class UiElement {
	private readonly element: HTMLElement;
	private static readonly CLASS_NAME: "ui-element" = "ui-element";

	/**
	 * Creates a base `UiElement` object.
	 */
	constructor() {
		const CLASS_NAME = UiElement.CLASS_NAME;
		this.element = create({
			name: "div",
			classes: [CLASS_NAME],
		});

		this.element.appendChild(
			create({
				name: "div",
				classes: [`${CLASS_NAME}-inner`],
			})
		);
	}

	/**
	 * Get this `UiElement`'s `HTMLElement`.
	 */
	public getElement(): HTMLElement {
		return this.element;
	}
}
