import { create, get, px } from "../utils/Utils.js";

/**
 * Represents a base `UiElement` object.
 */
export default abstract class UiElement {
	/**
	 * The `UiElement`'s width in pixels.
	 */
	protected abstract readonly width: number | undefined;
	/**
	 * The `UiElement`'s height in pixels.
	 */
	protected abstract readonly height: number | undefined;

	/**
	 * This `UiElement`'s `HTMLElement`.
	 */
	private readonly element: HTMLElement;
	/**
	 * Base class of all `UiElement`s.
	 */
	private static readonly CLASS_NAME: "ui-element" = "ui-element";
	/**
	 * The default amount of padding (in pixels) of all `UiElement`s.
	 */
	private static readonly DEFAULT_PADDING: 20 = 20;

	/**
	 * Creates a base `UiElement` object.
	 *
	 * @param width the `UiElement`'s width in pixels
	 * @param height the `UiElement`'s height in pixels
	 */
	constructor(width: number, height: number) {
		const CLASS_NAME = UiElement.CLASS_NAME;
		this.element = create({
			name: "div",
			classes: [CLASS_NAME],
		});

		this.element.css({
			width: px(width),
			height: px(height),
		});
		this.element.appendChild(
			create({
				name: "div",
				classes: [`${CLASS_NAME}-inner`],
			}).css({
				width: px(width - UiElement.DEFAULT_PADDING),
				height: px(height - UiElement.DEFAULT_PADDING),
			}) as HTMLElement
		);
	}

	/**
	 * Get this `UiElement`'s `HTMLElement`.
	 */
	public getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Renders this `UiElement` to the actual screen. Should only be used for _finalized_ groups
	 * of `UiElement`s or testing.
	 */
	public renderToGame(): void {
		get("game")!.appendChild(this.element);
	}
}
