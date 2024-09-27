import ImageRegistry from "../../../src/main/assets/ImageRegistry.js";
import { BoardObject } from "../../../src/main/board/boardobject/BoardObject.js";
import PacMan from "../../../src/main/board/boardobject/children/character/PacMan.js";
import { BOARD_OBJECT_Z_INDEX, BOARDOBJECTS } from "../../../src/main/utils/Globals.js";
import { originalPacManSpeedToNewSpeed } from "../../../src/main/utils/Utils.js";
import Assertion from "../../base/Assertion.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

@tests(BoardObject)
export default class BoardObjectTest extends Test {
	/**
	 * Tests that a `BoardObject` instances are created correctly.
	 */
	public createBoardObjectTest(): void {
		const pacmanSpeed = originalPacManSpeedToNewSpeed(55);
		const pacmanImageSrc = ImageRegistry.getImage("pacman-0");
		let pacmanName = "";

		// no empty names
		Assertion.assertThrows(Error.name, "PacMan.constructor()", () => {
			new PacMan(pacmanName, pacmanSpeed, pacmanImageSrc);
		});

		// no empty names
		try {
			new PacMan(pacmanName, pacmanSpeed, pacmanImageSrc);
		} catch (error: any) {
			Assertion.assertStrictlyEqual(
				"Error in BoardObject.js -- constructor(): BoardObject must have a name",
				error.message
			);
		}

		pacmanName = "pacman1";
		const pacman1 = new PacMan(pacmanName, pacmanSpeed, pacmanImageSrc);

		// no duplicate names
		Assertion.assertThrows(Error.name, "PacMan.constructor()", () => {
			new PacMan(pacmanName, pacmanSpeed, pacmanImageSrc);
		});

		// no duplicate names
		try {
			new PacMan(pacmanName, pacmanSpeed, pacmanImageSrc);
		} catch (error: any) {
			Assertion.assertStrictlyEqual(
				`Error in BoardObject.js -- constructor(): A BoardObject with the name '${pacmanName}' already exists`,
				error.message
			);
		}

		Assertion.assertStrictlyEqual(pacmanName, pacman1.getName());
		Assertion.assertNotEmpty(BOARDOBJECTS.filter((boardObject) => boardObject.getName() === pacmanName));

		const boardObjectElement = pacman1.getElement();

		Assertion.assertStrictlyEqual("DIV", boardObjectElement.tagName);
		Assertion.assertStrictlyEqual(pacmanName, boardObjectElement.id);
		Assertion.assertTrue(boardObjectElement.classList.contains("board-object"));
		Assertion.assertStrictlyEqual(BOARD_OBJECT_Z_INDEX, Number(boardObjectElement.css("zIndex")));
	}
}
