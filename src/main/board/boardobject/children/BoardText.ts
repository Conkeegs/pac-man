"use strict";

import DebugWindow from "../../../debugwindow/DebugWindow.js";
import { BOARD_OBJECT_Z_INDEX, TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Represents text on the board.
 */
export default class BoardText extends BoardObject {
	/**
	 * The current text being displayed.
	 */
	private text: string = "";
	/**
	 * The color of the text being displayed.
	 */
	private color: string;
	/**
	 * Whether or not the displayed text should be displayed vertically (defaults to `false`).
	 */
	private vertical: boolean;

	public override readonly width: number = TILESIZE;
	public override readonly height: number = TILESIZE;

	/**
	 * Creates a board text object.
	 *
	 * @param data information about how to display the text
	 */
	constructor(data: {
		name: string;
		/**
		 * The text to be displayed to the user.
		 */
		text: string;
		/**
		 * Font size of `text`. Defaults to `TILESIZE`.
		 */
		fontsize?: number;
		/**
		 * Color of `text`. Defaults to `white`.
		 */
		color?: string;
		/**
		 * Whether or not to display the text vertically. Defaults to `false`.
		 */
		vertical?: boolean;
	}) {
		super(data.name);

		const fontSize = data.fontsize || TILESIZE;

		if (fontSize > 24) {
			DebugWindow.error(
				"BoardText.js",
				"constructor",
				`fontsize cannot be greater than tile size: ${px(TILESIZE)}.`
			);
		}

		// display text above board objects
		this.element.css({
			zIndex: BOARD_OBJECT_Z_INDEX + 2,
		});

		this.color = data.color || "white";
		this.vertical = data.vertical ?? false;

		this.setText(data.text);
	}

	/**
	 * Sets the text that is visually displayed in this boardtext object and also in-memory. "Grows" to the left the
	 * more characters are added.
	 *
	 * @param newText the text to visually display
	 */
	public setText(newText: string): void {
		if (this.element.hasChildNodes()) {
			this.element.removeAllChildren();
		}

		// we want to reverse the text first, since pacman text "grows" to the left, the more characters
		// are added
		for (const [index, character] of Object.entries(newText.reverse())) {
			// create a tile-sized container for each character in the text, so each character appears to
			// display in a different tile
			const container = create({
				name: "div",
				classes: ["board-text-container"],
			}).css({
				color: this.color,
				width: px(TILESIZE),
				height: px(TILESIZE),
			}) as HTMLElement;

			// judge whether or not to display text vertically
			container.css({
				[!this.vertical ? "left" : "top"]: px(-(TILESIZE * Number(index))),
			});

			container.textContent = character;

			(this.element as HTMLElement).appendChild(container);
		}

		this.text += newText;
	}
}
