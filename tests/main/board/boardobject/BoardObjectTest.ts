import { App } from "../../../../src/main/App.js";
import { BoardObject } from "../../../../src/main/board/boardobject/BoardObject.js";
import Clyde from "../../../../src/main/board/boardobject/children/character/Clyde.js";
import PacMan from "../../../../src/main/board/boardobject/children/character/PacMan.js";
import Pinky from "../../../../src/main/board/boardobject/children/character/Pinky.js";
import { get, px } from "../../../../src/main/utils/Utils.js";
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
		this.assertNotEmpty(App.BOARDOBJECTS.filter((boardObject) => boardObject.getName() === pacmanName));
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
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

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
		this.assertStrictlyEqual(olderOffset, position.x);
		this.assertStrictlyEqual(olderOffset, position.y);
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

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
		this.assertStrictlyEqual(oldOffset, position.x);
		this.assertStrictlyEqual(oldOffset, position.y);
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0 + (oldOffset - olderOffset), oldTransform.x);
		this.assertStrictlyEqual(0 + (oldOffset - olderOffset), oldTransform.y);

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
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(oldTransform.x + (offset - oldOffset), transform.x);
		this.assertStrictlyEqual(oldTransform.y + (offset - oldOffset), transform.y);
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
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		pinky.setPositionX(olderOffset, {
			modifyCss: true,
			modifyTransform: false,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(olderOffset, position.x);
		this.assertNotStrictlyEqual(olderOffset, position.y);
		this.assertNotStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		pinky.setPositionX(oldOffset, {
			modifyCss: false,
			modifyTransform: true,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should not be same since not changed and transform should be equal to current transform + difference in positions
		this.assertStrictlyEqual(oldOffset, position.x);
		this.assertNotStrictlyEqual(oldOffset, position.y);
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0 + (oldOffset - olderOffset), transform.x);
		this.assertNotStrictlyEqual(0 + (oldOffset - olderOffset), transform.y);

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
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(oldTransformX + (offset - oldOffset), transform.x);
		this.assertNotStrictlyEqual(oldTransformY + (offset - oldOffset), transform.y);
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
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		pinky.setPositionY(olderOffset, {
			modifyCss: true,
			modifyTransform: false,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertNotStrictlyEqual(olderOffset, position.x);
		this.assertStrictlyEqual(olderOffset, position.y);
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		pinky.setPositionY(oldOffset, {
			modifyCss: false,
			modifyTransform: true,
		});
		pinky.render();

		position = pinky.getPosition();
		transform = pinky.getTransform();

		// css should not be same since not changed and transform should be equal to current transform + difference in positions
		this.assertNotStrictlyEqual(oldOffset, position.x);
		this.assertStrictlyEqual(oldOffset, position.y);
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		this.assertNotStrictlyEqual(0 + (oldOffset - olderOffset), transform.x);
		this.assertStrictlyEqual(0 + (oldOffset - olderOffset), transform.y);

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
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertNotStrictlyEqual(oldTransformX + (offset - oldOffset), transform.x);
		this.assertStrictlyEqual(oldTransformY + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that board objects can be deleted properly.
	 */
	public deleteTest(): void {
		const name = "clyde";
		const clyde = new Clyde();

		get("game")!.appendChild(clyde.getElement());

		this.assertNotNull(get(name));
		this.assertArrayContains(clyde, App.BOARDOBJECTS);

		clyde.delete();
		clyde.render();

		this.assertNull(get(name));
		this.assertArrayDoesntContain(clyde, App.BOARDOBJECTS);
	}

	/**
	 * Test that board objects can be rendered properly.
	 */
	public renderTest(): void {
		const clyde = new Clyde();

		this.assertArrayLength(0, clyde["queuedRenderUpdates"]);
		this.assertArrayDoesntContain(clyde, App.BOARDOBJECTS_TO_RENDER);
		this.assertFalse(clyde["readyForRender"]);

		clyde.setPosition(
			{
				x: 100,
				y: 300,
			},
			{
				modifyCss: true,
			}
		);
		clyde.setPosition(
			{
				x: 300,
				y: 100,
			},
			{
				modifyCss: true,
			}
		);

		this.assertArrayLength(2, clyde["queuedRenderUpdates"]);
		this.assertArrayContains(clyde, App.BOARDOBJECTS_TO_RENDER);
		this.assertTrue(clyde["readyForRender"]);

		clyde.render();

		this.assertFalse(clyde["readyForRender"]);
		this.assertArrayLength(0, clyde["queuedRenderUpdates"]);
		this.assertArrayDoesntContain(clyde, App.BOARDOBJECTS_TO_RENDER);
	}

	/**
	 * Test that board objects can render CSS changes properly to the screen.
	 */
	public queueRenderUpdateTest(): void {
		const clyde = new Clyde();

		this.assertArrayLength(0, clyde["queuedRenderUpdates"]);
		this.assertFalse(clyde["readyForRender"]);

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

		this.assertArrayLength(1, clyde["queuedRenderUpdates"]);
		this.assertEmpty(clydeElement.css("left") as string);
		this.assertEmpty(clydeElement.css("top") as string);
		this.assertTrue(clyde["readyForRender"]);
		this.assertArrayLength(1, App.BOARDOBJECTS_TO_RENDER);

		// another visual update
		clyde.setPosition(
			{
				x: position.x,
				y: position.y,
			},
			{
				modifyCss: true,
			}
		);

		// queueing another update should not push board object to "BOARDOBJECTS_TO_RENDER" more
		// than once
		this.assertArrayLength(1, App.BOARDOBJECTS_TO_RENDER);

		clyde.render();

		clydeElement = clyde.getElement();

		this.assertArrayLength(0, clyde["queuedRenderUpdates"]);
		this.assertStrictlyEqual(px(position.x), clydeElement.css("left"));
		this.assertStrictlyEqual(px(position.y), clydeElement.css("top"));
		this.assertFalse(clyde["readyForRender"]);
		this.assertArrayLength(0, App.BOARDOBJECTS_TO_RENDER);
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
