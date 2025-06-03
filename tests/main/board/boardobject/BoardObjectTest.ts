import { BoardObject } from "../../../../src/main/board/boardobject/BoardObject.js";
import PacMan from "../../../../src/main/board/boardobject/children/character/PacMan.js";
import Test from "../../../base/Base.js";
import { tests } from "../../../base/Decorators.js";

/**
 * Tests the functionality of a `BoardObject` instance.
 */
@tests(BoardObject)
export default class BoardObjectTest extends Test {
	/**
	 * Tests that a `BoardObject` instances are created correctly.
	 */
	public createBoardObjectTest(): void {
		let pacmanName = "";

		pacmanName = "pacman1";
		const pacman1 = new PacMan(pacmanName);

		this.assertStrictlyEqual(pacmanName, pacman1.getName());

		const boardObjectElement = pacman1.getElement();

		this.assertStrictlyEqual("DIV", boardObjectElement.tagName);
		this.assertStrictlyEqual(pacmanName, boardObjectElement.id);
		this.assertTrue(boardObjectElement.classList.contains("board-object"));
		this.assertStrictlyEqual(BoardObject.BOARD_OBJECT_Z_INDEX, Number(boardObjectElement.css("zIndex")));
	}
}
