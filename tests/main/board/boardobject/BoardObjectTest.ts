import { App } from "../../../../src/main/App.js";
import Board from "../../../../src/main/board/Board.js";
import { BoardObject } from "../../../../src/main/board/boardobject/BoardObject.js";
import Clyde from "../../../../src/main/board/boardobject/children/character/Clyde.js";
import Inky from "../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../src/main/board/boardobject/children/character/PacMan.js";
import Pinky from "../../../../src/main/board/boardobject/children/character/Pinky.js";
import Food from "../../../../src/main/board/boardobject/children/Food.js";
import { ROWS, TILESIZE } from "../../../../src/main/utils/Globals.js";
import { get, px } from "../../../../src/main/utils/Utils.js";
import Assertion from "../../../base/Assertion.js";
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

		// no empty names
		Assertion.assertThrows(Error.name, "PacMan.constructor()", () => {
			new PacMan(pacmanName);
		});

		// no empty names
		try {
			new PacMan(pacmanName);
		} catch (error: any) {
			Assertion.assertStrictlyEqual(
				"Error in BoardObject.js -- constructor(): BoardObject must have a name",
				error.message
			);
		}

		pacmanName = "pacman1";
		const pacman1 = new PacMan(pacmanName);

		// no duplicate names
		Assertion.assertThrows(Error.name, "PacMan.constructor()", () => {
			new PacMan(pacmanName);
		});

		// no duplicate names
		try {
			new PacMan(pacmanName);
		} catch (error: any) {
			Assertion.assertStrictlyEqual(
				`Error in BoardObject.js -- constructor(): A BoardObject with the name '${pacmanName}' already exists`,
				error.message
			);
		}

		Assertion.assertStrictlyEqual(pacmanName, pacman1.getName());
		Assertion.assertNotEmpty(App.BOARDOBJECTS.filter((boardObject) => boardObject.getName() === pacmanName));

		const boardObjectElement = pacman1.getElement();

		Assertion.assertStrictlyEqual("DIV", boardObjectElement.tagName);
		Assertion.assertStrictlyEqual(pacmanName, boardObjectElement.id);
		Assertion.assertTrue(boardObjectElement.classList.contains("board-object"));
		Assertion.assertStrictlyEqual(BoardObject.BOARD_OBJECT_Z_INDEX, Number(boardObjectElement.css("zIndex")));
	}

	/**
	 * Test that board objects correctly have their positions retrieved.
	 */
	public getPositionTest(): void {
		const pacman = new PacMan();
		let position = pacman.getPosition();

		// haven't placed on board yet so position should be default
		Assertion.assertOfType("object", pacman.getPosition());
		Assertion.assertStrictlyEqual(0, position.x);
		Assertion.assertStrictlyEqual(0, position.y);

		const board = Board.getInstance();
		const numTiles = 5;

		Reflect.apply(board["placeBoardObject"], board, [pacman, numTiles, numTiles]);

		position = pacman.getPosition();

		Assertion.assertOfType("object", position);
		Assertion.assertOfType("number", position.x);
		Assertion.assertOfType("number", position.y);
		Assertion.assertStrictlyEqual(TILESIZE * numTiles - TILESIZE, position.x);
		Assertion.assertStrictlyEqual(Board.calcTileOffset(ROWS) - TILESIZE * numTiles - TILESIZE, position.y);
	}

	/**
	 * Test that board objects correctly have their css transforms retrieved.
	 */
	public getTransformTest(): void {
		const pacman = new PacMan();

		// haven't moved on board yet so transform should be 0
		Assertion.assertStrictlyEqual(0, pacman.getTransform().x);
		Assertion.assertStrictlyEqual(0, pacman.getTransform().y);
	}

	/**
	 * Test that a board object's HTMLElement can be retrieved correctly.
	 */
	public getElementTest(): void {
		const food = new Food("test-food");
		const foodElement = food.getElement();

		Assertion.assertExists(foodElement);
		Assertion.assertStrictlyEqual(HTMLDivElement.name, foodElement.constructor.name);
	}

	/**
	 * Test that a board object's name can be retried correctly.
	 */
	public getNameTest(): void {
		const name = "testing-food";
		const food = new Food(name);
		const foodName = food.getName();

		Assertion.assertNotEmpty(foodName);
		Assertion.assertStrictlyEqual(name, foodName);

		const foodElementId = food.getElement().id;

		Assertion.assertStrictlyEqual(foodElementId, foodName);
		Assertion.assertStrictlyEqual(name, foodElementId);
	}

	/**
	 * Test that board objects correctly have their width set.
	 */
	public getWidthTest(): void {
		const inky = new Inky();

		// haven't placed on board yet so width should be undefined
		Assertion.assertOfType("number", inky.getWidth());
	}

	/**
	 * Test that board objects correctly have their height set.
	 */
	public getHeightTest(): void {
		const inky = new Inky();

		// haven't placed on board yet so height should be undefined
		Assertion.assertOfType("number", inky.getHeight());
	}

	/**
	 * Test that board objects correctly have their center positions retrieved.
	 */
	public getCenterPositionTest(): void {
		const pacman = new PacMan();
		let centerPosition = pacman.getCenterPosition();

		// haven't placed on board yet so position should be default
		Assertion.assertOfType("object", pacman.getCenterPosition());
		Assertion.assertStrictlyEqual(0 + pacman.getWidth() / 2, centerPosition.x);
		Assertion.assertStrictlyEqual(0 + pacman.getHeight() / 2, centerPosition.y);
	}

	/**
	 * Test that board objects correctly have their positions set.
	 */
	public setPositionTest(): void {
		const pinky = new Pinky();
		const pinkyElement = pinky.getElement();
		let offset = 500;

		pinky.setPosition(
			{
				x: offset,
				y: offset,
			},
			{
				modifyCss: false,
				modifyTransform: false,
			}
		);

		let position = pinky.getPosition();
		let transform = pinky.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		Assertion.assertStrictlyEqual(offset, position.x);
		Assertion.assertStrictlyEqual(offset, position.y);
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		pinky.setPosition(
			{
				x: olderOffset,
				y: olderOffset,
			},
			{
				modifyCss: true,
				modifyTransform: false,
			}
		);
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		Assertion.assertStrictlyEqual(olderOffset, position.x);
		Assertion.assertStrictlyEqual(olderOffset, position.y);
		Assertion.assertStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		Assertion.assertStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		pinky.setPosition(
			{
				x: oldOffset,
				y: oldOffset,
			},
			{
				modifyCss: false,
				modifyTransform: true,
			}
		);
		pinky.render();

		position = pinky.getPosition();
		const oldTransform = pinky.getTransform();

		// css should not be same since not changed and transform should be equal to current transform + difference in positions
		Assertion.assertStrictlyEqual(oldOffset, position.x);
		Assertion.assertStrictlyEqual(oldOffset, position.y);
		Assertion.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0 + (oldOffset - olderOffset), oldTransform.x);
		Assertion.assertStrictlyEqual(0 + (oldOffset - olderOffset), oldTransform.y);

		offset = 800;

		pinky.setPosition(
			{
				x: offset,
				y: offset,
			},
			{
				modifyCss: true,
				modifyTransform: true,
			}
		);
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should same since changed and transform should be equal to current transform + difference in positions
		Assertion.assertStrictlyEqual(offset, position.x);
		Assertion.assertStrictlyEqual(offset, position.y);
		Assertion.assertStrictlyEqual(px(offset), pinkyElement.css("top"));
		Assertion.assertStrictlyEqual(px(offset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(oldTransform.x + (offset - oldOffset), transform.x);
		Assertion.assertStrictlyEqual(oldTransform.y + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that board objects correctly have their x positions set.
	 */
	public setPositionXTest(): void {
		const pinky = new Pinky();
		const pinkyElement = pinky.getElement();
		let offset = 500;

		pinky.setPositionX(offset, {
			modifyCss: false,
			modifyTransform: false,
		});

		let position = pinky.getPosition();
		let transform = pinky.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		Assertion.assertStrictlyEqual(offset, position.x);
		Assertion.assertNotStrictlyEqual(offset, position.y);
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		pinky.setPositionX(olderOffset, {
			modifyCss: true,
			modifyTransform: false,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		Assertion.assertStrictlyEqual(olderOffset, position.x);
		Assertion.assertNotStrictlyEqual(olderOffset, position.y);
		Assertion.assertNotStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		Assertion.assertStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		pinky.setPositionX(oldOffset, {
			modifyCss: false,
			modifyTransform: true,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should not be same since not changed and transform should be equal to current transform + difference in positions
		Assertion.assertStrictlyEqual(oldOffset, position.x);
		Assertion.assertNotStrictlyEqual(oldOffset, position.y);
		Assertion.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0 + (oldOffset - olderOffset), transform.x);
		Assertion.assertNotStrictlyEqual(0 + (oldOffset - olderOffset), transform.y);

		offset = 800;
		const oldTransformX = transform.x;
		const oldTransformY = transform.y;

		pinky.setPositionX(offset, {
			modifyCss: true,
			modifyTransform: true,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should same since changed and transform should be equal to current transform + difference in positions
		Assertion.assertStrictlyEqual(offset, position.x);
		Assertion.assertNotStrictlyEqual(offset, position.y);
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		Assertion.assertStrictlyEqual(px(offset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(oldTransformX + (offset - oldOffset), transform.x);
		Assertion.assertNotStrictlyEqual(oldTransformY + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that board objects correctly have their y positions set.
	 */
	public setPositionYTest(): void {
		const pinky = new Pinky();
		const pinkyElement = pinky.getElement();
		let offset = 500;

		pinky.setPositionY(offset, {
			modifyCss: false,
			modifyTransform: false,
		});

		let position = pinky.getPosition();
		let transform = pinky.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		Assertion.assertNotStrictlyEqual(offset, position.x);
		Assertion.assertStrictlyEqual(offset, position.y);
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		pinky.setPositionY(olderOffset, {
			modifyCss: true,
			modifyTransform: false,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		Assertion.assertNotStrictlyEqual(olderOffset, position.x);
		Assertion.assertStrictlyEqual(olderOffset, position.y);
		Assertion.assertStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		pinky.setPositionY(oldOffset, {
			modifyCss: false,
			modifyTransform: true,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should not be same since not changed and transform should be equal to current transform + difference in positions
		Assertion.assertNotStrictlyEqual(oldOffset, position.x);
		Assertion.assertStrictlyEqual(oldOffset, position.y);
		Assertion.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		Assertion.assertNotStrictlyEqual(0 + (oldOffset - olderOffset), transform.x);
		Assertion.assertStrictlyEqual(0 + (oldOffset - olderOffset), transform.y);

		offset = 800;
		const oldTransformX = transform.x;
		const oldTransformY = transform.y;

		pinky.setPositionY(offset, {
			modifyCss: true,
			modifyTransform: true,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should same since changed and transform should be equal to current transform + difference in positions
		Assertion.assertNotStrictlyEqual(offset, position.x);
		Assertion.assertStrictlyEqual(offset, position.y);
		Assertion.assertStrictlyEqual(px(offset), pinkyElement.css("top"));
		Assertion.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		Assertion.assertNotStrictlyEqual(oldTransformX + (offset - oldOffset), transform.x);
		Assertion.assertStrictlyEqual(oldTransformY + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that board objects can be deleted properly.
	 */
	public deleteTest(): void {
		const name = "clyde";
		const clyde = new Clyde();

		get("game")!.appendChild(clyde.getElement());

		Assertion.assertNotNull(get(name));
		Assertion.assertArrayContains(clyde, App.BOARDOBJECTS);

		clyde.delete();
		clyde.render();

		Assertion.assertNull(get(name));
		Assertion.assertArrayDoesntContain(clyde, App.BOARDOBJECTS);
	}

	/**
	 * Test that board objects can be rendered properly.
	 */
	public renderTest(): void {
		const clyde = new Clyde();

		Assertion.assertArrayLength(0, clyde["queuedRenderUpdates"]);
		Assertion.assertArrayDoesntContain(clyde, App.BOARDOBJECTS_TO_RENDER);

		clyde.setPosition(
			{
				x: 100,
				y: 300,
			},
			{
				modifyCss: true,
			}
		);

		Assertion.assertArrayLength(1, clyde["queuedRenderUpdates"]);
		Assertion.assertArrayContains(clyde, App.BOARDOBJECTS_TO_RENDER);

		clyde.render();

		Assertion.assertArrayDoesntContain(clyde, App.BOARDOBJECTS_TO_RENDER);
	}

	/**
	 * Test that board objects can render CSS changes properly to the screen.
	 */
	public queueRenderUpdateTest(): void {
		const clyde = new Clyde();

		Assertion.assertArrayLength(0, clyde["queuedRenderUpdates"]);

		const position = {
			x: 900,
			y: 700,
		};

		// modifying css positions only should only queue 1 update for CSS "left" and "top" values
		// on the board object
		clyde.setPosition(
			{
				x: position.x,
				y: position.y,
			},
			{
				modifyCss: true,
			}
		);

		let clydeElement = clyde.getElement();

		Assertion.assertArrayLength(1, clyde["queuedRenderUpdates"]);
		Assertion.assertEmpty(clydeElement.css("left") as string);
		Assertion.assertEmpty(clydeElement.css("top") as string);

		clyde.render();

		clydeElement = clyde.getElement();

		Assertion.assertArrayLength(0, clyde["queuedRenderUpdates"]);
		Assertion.assertStrictlyEqual(px(position.x), clydeElement.css("left"));
		Assertion.assertStrictlyEqual(px(position.y), clydeElement.css("top"));
	}

	/**
	 * Test that board objects can set their css transforms properly.
	 */
	public setTransformTest(): void {
		const clyde = new Clyde();
		let transform = clyde.getTransform();

		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const newTransformX = 500;
		const newTransformY = 600;

		Reflect.apply(clyde["setTransform"], clyde, [{ x: newTransformX, y: newTransformY }]);
		clyde.render();

		transform = clyde.getTransform();

		Assertion.assertStrictlyEqual(newTransformX, transform.x);
		Assertion.assertStrictlyEqual(newTransformY, transform.y);
		Assertion.assertStrictlyEqual(
			JSON.stringify({ x: newTransformX, y: newTransformY }),
			JSON.stringify(transform)
		);
		Assertion.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			clyde.getElement().css("transform")
		);
	}

	/**
	 * Test that board objects can set their css transform x values properly.
	 */
	public setTransformXTest(): void {
		const clyde = new Clyde();
		const newTransformY = 600;
		let transform = clyde.getTransform();

		Reflect.apply(clyde["setTransformY"], clyde, [newTransformY]);

		Assertion.assertStrictlyEqual(0, transform.x);
		Assertion.assertStrictlyEqual(newTransformY, transform.y);

		const newTransformX = 500;

		Reflect.apply(clyde["setTransformX"], clyde, [newTransformX]);
		clyde.render();

		transform = clyde.getTransform();

		Assertion.assertStrictlyEqual(newTransformX, transform.x);
		Assertion.assertStrictlyEqual(
			JSON.stringify({ x: newTransformX, y: newTransformY }),
			JSON.stringify(transform)
		);
		Assertion.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			clyde.getElement().css("transform")
		);
	}

	/**
	 * Test that board objects can set their css transform y values properly.
	 */
	public setTransformYTest(): void {
		const clyde = new Clyde();
		const newTransformX = 600;
		let transform = clyde.getTransform();

		Reflect.apply(clyde["setTransformX"], clyde, [newTransformX]);

		Assertion.assertStrictlyEqual(newTransformX, transform.x);
		Assertion.assertStrictlyEqual(0, transform.y);

		const newTransformY = 500;

		Reflect.apply(clyde["setTransformY"], clyde, [newTransformY]);
		clyde.render();

		transform = clyde.getTransform();

		Assertion.assertStrictlyEqual(newTransformY, transform.y);
		Assertion.assertStrictlyEqual(
			JSON.stringify({ x: newTransformX, y: newTransformY }),
			JSON.stringify(transform)
		);
		Assertion.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			clyde.getElement().css("transform")
		);
	}
}
