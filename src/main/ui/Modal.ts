import UiElement from "./UiElement.js";

/**
 * Represents a pop-up box in the app for menus.
 */
export default class Modal extends UiElement {
	public override readonly width: number;
	public override readonly height: number;

	/**
	 * Creates a modal.
	 *
	 * @param width the modal's width in pixels
	 * @param height the modal's height in pixels
	 */
	constructor(width: number, height: number) {
		super(width, height);

		this.width = width;
		this.height = height;
	}
}
