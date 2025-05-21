import { BoardObject } from "../../../../../src/main/board/boardobject/BoardObject.js";
import BoardText from "../../../../../src/main/board/boardobject/children/BoardText.js";
import { TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { px } from "../../../../../src/main/utils/Utils.js";
import Test from "../../../../base/Base.js";
import { tests } from "../../../../base/Decorators.js";

/**
 * Tests the functionality of `src\main\board\boardobject\children\BoardText.js`.
 */
@tests(BoardText)
export default class BoardTextTest extends Test {
	/**
	 * Test that board text instances can be created correctly.
	 */
	public createBoardTextTest(): void {
		const name = "test-boardtext";
		const text = "Display Text";
		let boardText = new BoardText({
			name,
			text,
		});
		let boardTextElement = boardText.getElement();

		this.assertStrictlyEqual(TILESIZE, boardText.getFontSize());
		this.assertStrictlyEqual(String(BoardObject.BOARD_OBJECT_Z_INDEX + 2), boardTextElement.css("zIndex"));
		this.assertStrictlyEqual("white", boardText.getColor());
		this.assertFalse(boardText.isVertical());
		this.assertStrictlyEqual(text, boardText.getText());

		// font size greater than "TILESIZE" should throw error
		// this.assertThrows(Error.name, "BoardText.constructor()", () => {
		// 	new BoardText({
		// 		name,
		// 		text,
		// 		fontSize: TILESIZE + 1,
		// 	});
		// });
	}

	/**
	 * Test that board text instances can get their colors correctly.
	 */
	public getColorTest(): void {
		const color = "blue";
		const boardText = new BoardText({
			name: "test-boardtext",
			text: "Display Text",
			color,
		});

		this.assertStrictlyEqual(color, boardText.getColor());
	}

	/**
	 * Test that board text instances can get their font sizes correctly.
	 */
	public getFontSizeTest(): void {
		const fontSize = 24;
		const boardText = new BoardText({
			name: "test-boardtext",
			text: "Display Text",
			fontSize,
		});

		this.assertStrictlyEqual(fontSize, boardText.getFontSize());
	}

	/**
	 * Test that board text instances can tell when they are displaying text vertically.
	 */
	public isVerticalTest(): void {
		const vertical = true;
		let boardText = new BoardText({
			name: "test-boardtext-1",
			text: "Display Text",
			vertical,
		});

		this.assertTrue(boardText.isVertical());

		boardText = new BoardText({
			name: "test-boardtext-2",
			text: "Display Text",
		});

		this.assertFalse(boardText.isVertical());
	}

	/**
	 * Test that board text instances can get their text correctly.
	 */
	public getTextTest(): void {
		const text = "This is a Button!";
		const boardText = new BoardText({
			name: "test-boardtext",
			text,
		});

		this.assertStrictlyEqual(text, boardText.getText());
	}

	/**
	 * Test that board text instances can set their text correctly.
	 */
	public setTextTest(): void {
		const text = "This is a Button!";
		// set text called when board text created
		let boardText = new BoardText({
			name: "test-boardtext-1",
			text,
		});
		let boardTextElement = boardText.getElement();

		this.assertStrictlyEqual(text.length, boardTextElement.getElementsByClassName("board-text-container").length);

		let boardTextChildren = boardTextElement.children;

		for (let i = 0; i < boardTextChildren.length; i++) {
			const textContainer = boardTextChildren[i] as HTMLDivElement;

			this.assertStrictlyEqual(boardText.getColor(), textContainer.css("color"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("width"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("height"));
			this.assertStrictlyEqual(px(-(TILESIZE * i)), textContainer.css("left"));
			this.assertTrue(text.includes(textContainer.textContent!));
			this.assertTrue(boardTextElement.contains(textContainer));
		}

		this.assertStrictlyEqual(px(boardText.getWidth()), boardTextElement.css("width"));
		this.assertStrictlyEqual(px(TILESIZE), boardTextElement.css("height"));
		this.assertStrictlyEqual(text, boardText.getText());

		const newText = text + " Some more text!";

		// explicitly call method now
		boardText.setText(newText);

		this.assertStrictlyEqual(
			newText.length,
			boardTextElement.getElementsByClassName("board-text-container").length
		);

		boardTextChildren = boardTextElement.children;

		for (let i = 0; i < boardTextChildren.length; i++) {
			const textContainer = boardTextChildren[i] as HTMLDivElement;

			this.assertStrictlyEqual(boardText.getColor(), textContainer.css("color"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("width"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("height"));
			this.assertStrictlyEqual(px(-(TILESIZE * i)), textContainer.css("left"));
			this.assertTrue(newText.includes(textContainer.textContent!));
			this.assertTrue(boardTextElement.contains(textContainer));
		}

		this.assertStrictlyEqual(px(boardText.getWidth()), boardTextElement.css("width"));
		this.assertStrictlyEqual(px(TILESIZE), boardTextElement.css("height"));
		this.assertStrictlyEqual(newText, boardText.getText());

		boardText = new BoardText({
			name: "test-boardtext-2",
			text,
			vertical: true,
		});
		boardTextElement = boardText.getElement();

		this.assertStrictlyEqual(text.length, boardTextElement.getElementsByClassName("board-text-container").length);

		boardTextChildren = boardTextElement.children;

		for (let i = 0; i < boardTextChildren.length; i++) {
			const textContainer = boardTextChildren[i] as HTMLDivElement;

			this.assertStrictlyEqual(boardText.getColor(), textContainer.css("color"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("width"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("height"));
			this.assertStrictlyEqual(px(-(TILESIZE * i)), textContainer.css("top"));
			this.assertTrue(newText.includes(textContainer.textContent!));
			this.assertTrue(boardTextElement.contains(textContainer));
		}

		this.assertStrictlyEqual(px(TILESIZE), boardTextElement.css("width"));
		this.assertStrictlyEqual(px(boardText.getHeight()), boardTextElement.css("height"));
		this.assertStrictlyEqual(text, boardText.getText());

		// explicitly call method now
		boardText.setText(newText);

		this.assertStrictlyEqual(
			newText.length,
			boardTextElement.getElementsByClassName("board-text-container").length
		);

		boardTextChildren = boardTextElement.children;

		for (let i = 0; i < boardTextChildren.length; i++) {
			const textContainer = boardTextChildren[i] as HTMLDivElement;

			this.assertStrictlyEqual(boardText.getColor(), textContainer.css("color"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("width"));
			this.assertStrictlyEqual(px(TILESIZE), textContainer.css("height"));
			this.assertStrictlyEqual(px(-(TILESIZE * i)), textContainer.css("top"));
			this.assertTrue(newText.includes(textContainer.textContent!));
			this.assertTrue(boardTextElement.contains(textContainer));
		}

		this.assertStrictlyEqual(px(TILESIZE), boardTextElement.css("width"));
		this.assertStrictlyEqual(px(boardText.getHeight()), boardTextElement.css("height"));
		this.assertStrictlyEqual(newText, boardText.getText());
	}
}
