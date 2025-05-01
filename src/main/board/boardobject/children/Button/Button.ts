import { App } from "../../../../App.js";
import Debugging from "../../../../Debugging.js";
import DebugWindow from "../../../../debugwindow/DebugWindow.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { create, px } from "../../../../utils/Utils.js";
import Board from "../../../Board.js";
import { BoardObject } from "../../BoardObject.js";
import BoardText from "../BoardText.js";

/**
 * Represents a clickable button on the board.
 */
export default class Button extends BoardObject {
	/**
	 * `Button`s' initial width in pixels.
	 */
	private static readonly BUTTON_INITIAL_WIDTH: number = 0;
	/**
	 * `Button`s' initial height in pixels.
	 */
	private static readonly BUTTON_INITIAL_HEIGHT: number = TILESIZE + TILESIZE / 2;

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

	/**
	 * Padding of the clip-path used on UI elements.
	 */
	public static CLIP_PATH_PIXEL_PADDING: 4 = 4;

	/**
	 * Creates a `Button`.
	 *
	 * @param name the unique name/id of the button
	 * @param text the text to be displayed in the button
	 */
	constructor(name: string, text: string) {
		super(name);

		this.setDimensions(Button.BUTTON_INITIAL_WIDTH, Button.BUTTON_INITIAL_HEIGHT);

		this.text = text;
		this.boardText = new BoardText({
			name: `${name}-text`,
			text: text,
		});

		const element = this.getElement();

		const boardText = this.boardText;
		const boardTextElement = boardText.getElement();
		const height = this.getHeight();

		// add "BoardText" as child of this button
		element.appendChild(boardTextElement);

		element.css({
			backgroundColor: "white",
		});

		const boardBackgroundColor = Board.BACKGROUND_COLOR;

		// change how button looks when hovered
		App.addEventListenerToElement("mouseenter", element, () => {
			(element.lastChild as HTMLDivElement).css({
				backgroundColor: "white",
			});

			boardTextElement.children.css({
				color: boardBackgroundColor,
			});
		});

		// change how button looks when un-hovered
		App.addEventListenerToElement("mouseleave", element, () => {
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
				height: px(height - Button.CLIP_PATH_PIXEL_PADDING),
				width: px(this.getWidth() - Button.CLIP_PATH_PIXEL_PADDING),
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
		if (Debugging.isEnabled()) {
			if (this.clickListenerCount > 1) {
				DebugWindow.error("Button.ts", "onClick", "More than one click listener assigned.");
			}
		}
		// #!END_DEBUG

		App.addEventListenerToElement("click", this.getElement(), callback);
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

		this.setWidth(boardText.getWidth()! + boardTextFontSize);
		const width = this.getWidth();
		const element = this.getElement();

		element.css({
			width: px(width),
		});
		(element.lastChild as HTMLDivElement).css({
			width: px(width - Button.CLIP_PATH_PIXEL_PADDING),
		});

		boardText.getElement().css({
			left: px(width - boardText.getFontSize() * 2 + boardText.getFontSize() / 2),
		});
	}
}
