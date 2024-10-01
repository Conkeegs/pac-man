import BoardText from "../../../../src/main/board/boardobject/children/BoardText.js";
import { BOARD_OBJECT_Z_INDEX, TILESIZE } from "../../../../src/main/utils/Globals.js";
import { px } from "../../../../src/main/utils/Utils.js";
import Assertion from "../../../base/Assertion.js";
import Test from "../../../base/Base.js";
import { tests } from "../../../base/Decorators.js";

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

		Assertion.assertStrictlyEqual(TILESIZE, boardText.getFontSize());
		Assertion.assertStrictlyEqual(BOARD_OBJECT_Z_INDEX + 2, boardTextElement.css("zIndex"));
		Assertion.assertStrictlyEqual(px(TILESIZE), boardTextElement.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE), boardTextElement.css("height"));
		Assertion.assertStrictlyEqual("white", boardText.getColor());
		Assertion.assertFalse(boardText.isVertical());
		Assertion.assertStrictlyEqual(text, boardText.getText());

		// font size greater than "TILESIZE" should throw error
		Assertion.assertThrows(Error.name, "BoardText.constructor()", () => {
			new BoardText({
				name,
				text,
				fontsize: TILESIZE + 1,
			});
		});
	}
}
