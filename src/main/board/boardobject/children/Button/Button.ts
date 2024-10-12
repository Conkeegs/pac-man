// #!DEBUG
import DebugWindow from "../../../../debugwindow/DebugWindow.js";
// #!END_DEBUG
import { CLIP_PATH_PIXEL_PADDING, TILESIZE } from "../../../../utils/Globals.js";
import { create, px } from "../../../../utils/Utils.js";
import Board from "../../../Board.js";
import { BoardObject } from "../../BoardObject.js";
import BoardText from "../BoardText.js";

/**
 * Represents a clickable button on the board.
 */
export default class Button extends BoardObject {
	/**
	 * The text being displayed in the button.
	 */
	private text: string = "";
	/**
	 * `BoardText` object that is used as a child of this button since its text will be
	 * displayed inside of it.
	 */
	private readonly boardText: BoardText;
	/**
	 * The amount of the "click" listeners this button can have at any one time.
	 */
	private clickListenerCount: 0 | 1 = 0;

	public override width: number = 0;
	public override readonly height: number = TILESIZE + TILESIZE / 2;

	/**
	 * Creates a `Button`.
	 *
	 * @param name the unique name/id of the button
	 * @param text the text to be displayed in the button
	 */
	constructor(name: string, text: string) {
		super(name);

		this.text = text;
		this.boardText = new BoardText({
			name: `${name}-text`,
			text: text,
		});

		const element = this.element;

		element.classList.add("button");

		const boardText = this.boardText;
		const boardTextElement = boardText.getElement();
		const height = this.height;

		// add "BoardText" as child of this button
		element.appendChild(boardTextElement);

		element.css({
			height: px(height),
			backgroundColor: "white",
		});

		const boardBackgroundColor = Board.BACKGROUND_COLOR;

		// change how button looks when hovered
		element.addEventListener("mouseenter", () => {
			(element.lastChild as HTMLDivElement).css({
				backgroundColor: "white",
			});

			boardTextElement.children.css({
				color: boardBackgroundColor,
			});
		});

		// change how button looks when un-hovered
		element.addEventListener("mouseleave", () => {
			(element.lastChild as HTMLDivElement).css({
				backgroundColor: boardBackgroundColor,
			});

			boardTextElement.children.css({
				color: boardText.getColor(),
			});
		});

		this.setText(text, true);

		element.appendChild(
			create({
				name: "div",
				classes: ["button-inner"],
			}).css({
				height: px(height - CLIP_PATH_PIXEL_PADDING),
				width: px(this.width - CLIP_PATH_PIXEL_PADDING),
				backgroundColor: boardBackgroundColor,
			}) as HTMLDivElement
		);
	}

	/**
	 * Registers a "click" listener for this button. This can only be done once.
	 *
	 * @param callback
	 */
	public onClick(callback: (...params: any[]) => unknown): void {
		this.clickListenerCount++;

		// #!DEBUG
		if (this.clickListenerCount > 1) {
			DebugWindow.error("Button.ts", "onClick", "More than one click listener assigned.");
		}
		// #!END_DEBUG

		this.element.addEventListener("click", callback);
	}

	/**
	 * Sets the text displayed in the button. Deals with setting width/height of the button as well, and
	 * making sure the button expands/contracts with the amount of text displayed.
	 *
	 * @param newText the text to be displayed
	 * @param initial whether or not the text is being set for the first time. Important for making sure that
	 * `BoardText.setText()` isn't called more than once unnecessarily (defaults to `false`)
	 */
	public setText(newText: string, initial = false): void {
		const boardText = this.boardText;

		if (!initial) {
			boardText.setText(newText);
		}

		const boardTextFontSize = boardText.getFontSize();

		this.width = boardText.getWidth()! + boardTextFontSize;
		const width = this.width;
		const element = this.element;

		element.css({
			width: px(width),
		});
		(element.lastChild as HTMLDivElement).css({
			width: px(width - CLIP_PATH_PIXEL_PADDING),
		});

		boardText.getElement().css({
			left: px(width - boardText.getFontSize() * 2 + boardText.getFontSize() / 2),
		});
	}
}
