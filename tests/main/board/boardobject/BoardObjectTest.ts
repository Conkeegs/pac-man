import { BoardObject } from "../../../../src/main/board/boardobject/BoardObject.js";
import Clyde from "../../../../src/main/board/boardobject/children/character/Clyde.js";
import PacMan from "../../../../src/main/board/boardobject/children/character/PacMan.js";
import { px } from "../../../../src/main/utils/Utils.js";
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
		this.assertFalse(pacman1["readyForRender"]);

		const boardObjectElement = pacman1.getElement();

		this.assertStrictlyEqual("DIV", boardObjectElement.tagName);
		this.assertStrictlyEqual(pacmanName, boardObjectElement.id);
		this.assertTrue(boardObjectElement.classList.contains("board-object"));
		this.assertStrictlyEqual(BoardObject.BOARD_OBJECT_Z_INDEX, Number(boardObjectElement.css("zIndex")));
	}

	/**
	 * Test that board objects correctly have their positions set.
	 */
	public setPositionTest(): void {
		const boardObject = new (class extends BoardObject {})("test-board-object", 0, 0);
		let offset = 500;

		boardObject.setPosition({
			x: offset,
			y: offset,
		});
		boardObject.render();

		let position = boardObject.getPosition();
		let transform = boardObject.getTransform();

		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);

		offset = 600;
		const childOffsetX = 10;
		const childOffsetY = 15;

		boardObject["addChild"]({
			offsetX: childOffsetX,
			offsetY: childOffsetY,
			gameElement: new (class extends BoardObject {})("child-board-object", 0, 0),
		});
		boardObject.setPosition({
			x: offset,
			y: offset,
		});

		position = boardObject.getPosition();
		transform = boardObject.getTransform();
		const child = boardObject.getChildren()[0]!.gameElement;
		const childPosition = child.getPosition();
		const childTransform = child.getTransform();

		// children should get same position + child offsets
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);
		this.assertStrictlyEqual(offset + childOffsetX, childPosition.x);
		this.assertStrictlyEqual(offset + childOffsetY, childPosition.y);
		this.assertStrictlyEqual(offset + childOffsetX, childTransform.x);
		this.assertStrictlyEqual(offset + childOffsetY, childTransform.y);
	}

	/**
	 * Test that board objects correctly have their x positions set.
	 */
	public setPositionXTest(): void {
		const boardObject = new (class extends BoardObject {})("test-board-object", 0, 0);
		let offset = 500;

		boardObject.setPositionX(offset);
		boardObject.render();

		let position = boardObject.getPosition();
		let transform = boardObject.getTransform();

		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(offset, transform.x);
		this.assertNotStrictlyEqual(offset, transform.y);

		offset = 600;
		const childOffsetX = 10;

		boardObject["addChild"]({
			offsetX: childOffsetX,
			offsetY: 0,
			gameElement: new (class extends BoardObject {})("child-board-object", 0, 0),
		});
		boardObject.setPositionX(offset);

		position = boardObject.getPosition();
		transform = boardObject.getTransform();
		const child = boardObject.getChildren()[0]!.gameElement;
		const childPosition = child.getPosition();
		const childTransform = child.getTransform();

		// children should get same position + child offsets
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(offset, transform.x);
		this.assertNotStrictlyEqual(offset, transform.y);
		this.assertStrictlyEqual(offset + childOffsetX, childPosition.x);
		this.assertNotStrictlyEqual(offset, childPosition.y);
		this.assertStrictlyEqual(offset + childOffsetX, childTransform.x);
		this.assertNotStrictlyEqual(offset, childTransform.y);
	}

	/**
	 * Test that board objects correctly have their y positions set.
	 */
	public setPositionYTest(): void {
		const boardObject = new (class extends BoardObject {})("test-board-object", 0, 0);
		let offset = 500;

		boardObject.setPositionY(offset);
		boardObject.render();

		let position = boardObject.getPosition();
		let transform = boardObject.getTransform();

		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);

		offset = 600;
		const childOffsetY = 10;

		boardObject["addChild"]({
			offsetX: 0,
			offsetY: childOffsetY,
			gameElement: new (class extends BoardObject {})("child-board-object", 0, 0),
		});
		boardObject.setPositionY(offset);

		position = boardObject.getPosition();
		transform = boardObject.getTransform();
		const child = boardObject.getChildren()[0]!.gameElement;
		const childPosition = child.getPosition();
		const childTransform = child.getTransform();

		// children should get same position + child offsets
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);
		this.assertNotStrictlyEqual(offset, childPosition.x);
		this.assertStrictlyEqual(offset + childOffsetY, childPosition.y);
		this.assertNotStrictlyEqual(offset, childTransform.x);
		this.assertStrictlyEqual(offset + childOffsetY, childTransform.y);
	}

	/**
	 * Test that board objects can be rendered properly.
	 */
	public renderTest(): void {
		const clyde = new Clyde();

		this.assertOfType("undefined", clyde["queuedRenderUpdate"]);
		// this.assertArrayDoesntContain(clyde, App.BOARDOBJECTS_TO_RENDER);
		this.assertFalse(clyde["readyForRender"]);

		clyde.setPosition({
			x: 100,
			y: 300,
		});
		clyde.setPosition({
			x: 300,
			y: 100,
		});

		this.assertOfType("function", clyde["queuedRenderUpdate"]);
		// this.assertArrayContains(clyde, App.BOARDOBJECTS_TO_RENDER);
		this.assertTrue(clyde["readyForRender"]);

		clyde.render();

		this.assertFalse(clyde["readyForRender"]);
		this.assertOfType("undefined", clyde["queuedRenderUpdate"]);
	}

	/**
	 * Test that board objects can render CSS changes properly to the screen.
	 */
	public queueRenderUpdateTest(): void {
		const clyde = new Clyde();

		this.assertOfType("undefined", clyde["queuedRenderUpdate"]);
		this.assertFalse(clyde["readyForRender"]);

		const position = {
			x: 900,
			y: 700,
		};

		// modifying transform positions only should only queue 1 update for transform "x" and "y" values
		// on the board object
		clyde.setPosition({
			x: position.x,
			y: position.y,
		});

		let clydeElement = clyde.getElement();
		let transform = clyde.getTransform();

		this.assertOfType("function", clyde["queuedRenderUpdate"]);
		this.assertEmpty(clydeElement.css("transform") as string);
		this.assertTrue(clyde["readyForRender"]);
		// this.assertArrayLength(1, App.BOARDOBJECTS_TO_RENDER);

		// another visual update
		clyde.setPosition({
			x: position.x,
			y: position.y,
		});

		// queueing another update should not push board object to "BOARDOBJECTS_TO_RENDER" more
		// than once
		// this.assertArrayLength(1, App.BOARDOBJECTS_TO_RENDER);

		clyde.render();

		clydeElement = clyde.getElement();
		transform = clyde.getTransform();

		this.assertOfType("undefined", clyde["queuedRenderUpdate"]);
		this.assertStrictlyEqual(px(position.x), px(transform.x));
		this.assertStrictlyEqual(px(position.y), px(transform.y));
		this.assertFalse(clyde["readyForRender"]);
	}

	/**
	 * Test that board objects can set their css transforms properly.
	 */
	public setTransformTest(): void {
		const clyde = new Clyde();
		let transform = clyde.getTransform();

		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const newTransformX = 500;
		const newTransformY = 600;

		Reflect.apply(clyde["setTransform"], clyde, [{ x: newTransformX, y: newTransformY }]);
		clyde.render();

		transform = clyde.getTransform();

		this.assertStrictlyEqual(newTransformX, transform.x);
		this.assertStrictlyEqual(newTransformY, transform.y);
		this.assertStrictlyEqual(JSON.stringify({ x: newTransformX, y: newTransformY }), JSON.stringify(transform));
		this.assertStrictlyEqual(
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

		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(newTransformY, transform.y);

		const newTransformX = 500;

		Reflect.apply(clyde["setTransformX"], clyde, [newTransformX]);
		clyde.render();

		transform = clyde.getTransform();

		this.assertStrictlyEqual(newTransformX, transform.x);
		this.assertStrictlyEqual(JSON.stringify({ x: newTransformX, y: newTransformY }), JSON.stringify(transform));
		this.assertStrictlyEqual(
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

		this.assertStrictlyEqual(newTransformX, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const newTransformY = 500;

		Reflect.apply(clyde["setTransformY"], clyde, [newTransformY]);
		clyde.render();

		transform = clyde.getTransform();

		this.assertStrictlyEqual(newTransformY, transform.y);
		this.assertStrictlyEqual(JSON.stringify({ x: newTransformX, y: newTransformY }), JSON.stringify(transform));
		this.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			clyde.getElement().css("transform")
		);
	}
}
