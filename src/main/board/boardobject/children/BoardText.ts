"use strict";

// #!DEBUG
import DebugWindow from "../../../debugwindow/DebugWindow.js";
// #!END_DEBUG
import { BOARD_OBJECT_Z_INDEX, TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import Board from "../../Board.js";
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
	 * The fontsize in pixels of the text to be displayed.
	 */
	private fontSize: number;
	/**
	 * The color of the text being displayed.
	 */
	private color: string;
	/**
	 * Whether or not the displayed text should be displayed vertically (defaults to `false`).
	 */
	private vertical: boolean;

	public override width: number = TILESIZE;
	public override height: number = TILESIZE;

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
		fontSize?: number;
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

		this.fontSize = data.fontSize || TILESIZE;

		// #!DEBUG
		if (this.fontSize > TILESIZE) {
			DebugWindow.error(
				"BoardText.js",
				"constructor",
				`fontsize cannot be greater than tile size: ${px(TILESIZE)}.`
			);
		}
		// #!END_DEBUG

		// display text above board objects
		this.element.css({
			zIndex: BOARD_OBJECT_Z_INDEX + 2,
			width: px(this.width),
			height: px(this.height),
		});

		this.color = data.color || "white";
		this.vertical = data.vertical ?? false;

		this.setText(data.text);
	}

	/**
	 * Get the color of the text displayed.
	 *
	 * @returns the color of the text displayed
	 */
	public getColor(): string {
		return this.color;
	}

	/**
	 * Get the fontsize of the text displayed.
	 *
	 * @returns the fontsize of the text displayed in pixels
	 */
	public getFontSize(): number {
		return this.fontSize;
	}

	/**
	 * Whether or not the text displayed is vertical.
	 *
	 * @returns the fontsize of the text displayed in pixels
	 */
	public isVertical(): boolean {
		return this.vertical;
	}

	/**
	 * Get the text displayed.
	 */
	public getText(): string {
		return this.text;
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

		const notVertical = !this.vertical;

		// reset width/height variable depending on display of text. we need to do this because
		// the width/height of the element will change when more characters are added/removed
		notVertical ? (this.width = 0) : (this.height = 0);

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
				// judge whether or not to display text vertically
				[notVertical ? "left" : "top"]: px(-(TILESIZE * Number(index))),
			}) as HTMLElement;

			container.textContent = character;

			(this.element as HTMLElement).appendChild(container);
		}

		const pixelDimensions = Board.calcTileOffset(newText.length);
		notVertical ? (this.width = pixelDimensions) : (this.height = pixelDimensions);

		this.element.css({
			[notVertical ? "width" : "height"]: px(notVertical ? this.width : this.height),
		});

		this.text = newText;
	}
}
