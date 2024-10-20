import { App } from "../../src/main/App.js";
import Board from "../../src/main/board/Board.js";
import Inky from "../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../src/main/board/boardobject/children/character/PacMan.js";
import Food from "../../src/main/board/boardobject/children/Food.js";
import { GameElement } from "../../src/main/GameElement.js";
import { ROWS, TILESIZE } from "../../src/main/utils/Globals.js";
import { get, px } from "../../src/main/utils/Utils.js";
import Test from "../base/Base.js";
import { tests } from "../base/Decorators.js";

/**
 * Tests functionality of `GameElement` instances.
 */
@tests(GameElement)
export default class GameElementTest extends Test {
	/**
	 * Test that game element instances are created correctly.
	 */
	public createGameElementTest(): void {
		let pacmanName = "";

		// no empty names
		this.assertThrows(Error.name, "GameElement.constructor()", () => {
			new PacMan(pacmanName);
		});

		// no empty names
		try {
			new PacMan(pacmanName);
		} catch (error: any) {
			this.assertStrictlyEqual(
				"Error in GameElement.js -- constructor(): GameElement must have a name",
				error.message
			);
		}

		pacmanName = "pacman1";
		const pacman1 = new PacMan(pacmanName);

		// no duplicate names
		this.assertThrows(Error.name, "GameElement.constructor()", () => {
			new PacMan(pacmanName);
		});

		// no duplicate names
		try {
			new PacMan(pacmanName);
		} catch (error: any) {
			this.assertStrictlyEqual(
				`Error in GameElement.js -- constructor(): A GameElement with the name '${pacmanName}' already exists`,
				error.message
			);
		}

		this.assertStrictlyEqual(pacmanName, pacman1.getName());
		this.assertNotEmpty(App.GAME_ELEMENTS.filter((gameElement) => gameElement.getName() === pacmanName));
	}

	/**
	 * Test that game elements correctly have their positions retrieved.
	 */
	public getPositionTest(): void {
		const pacman = new PacMan();
		let position = pacman.getPosition();

		// haven't placed on board yet so position should be default
		this.assertOfType("object", pacman.getPosition());
		this.assertStrictlyEqual(0, position.x);
		this.assertStrictlyEqual(0, position.y);

		const board = Board.getInstance();
		const numTiles = 5;

		Reflect.apply(board["placeBoardObject"], board, [pacman, numTiles, numTiles]);

		position = pacman.getPosition();

		this.assertOfType("object", position);
		this.assertOfType("number", position.x);
		this.assertOfType("number", position.y);
		this.assertStrictlyEqual(TILESIZE * numTiles - TILESIZE, position.x);
		this.assertStrictlyEqual(Board.calcTileOffset(ROWS) - TILESIZE * numTiles - TILESIZE, position.y);
	}

	/**
	 * Test that game elements correctly have their css transforms retrieved.
	 */
	public getTransformTest(): void {
		const pacman = new PacMan();

		// haven't moved on board yet so transform should be 0
		this.assertStrictlyEqual(0, pacman.getTransform().x);
		this.assertStrictlyEqual(0, pacman.getTransform().y);
	}

	/**
	 * Test that a game element's HTMLElement can be retrieved correctly.
	 */
	public getElementTest(): void {
		const food = new Food("test-food");
		const foodElement = food.getElement();

		this.assertExists(foodElement);
		this.assertStrictlyEqual(HTMLDivElement.name, foodElement.constructor.name);
	}

	/**
	 * Test that a game element's name can be retried correctly.
	 */
	public getNameTest(): void {
		const name = "testing-food";
		const food = new Food(name);
		const foodName = food.getName();

		this.assertNotEmpty(foodName);
		this.assertStrictlyEqual(name, foodName);

		const foodElementId = food.getElement().id;

		this.assertStrictlyEqual(foodElementId, foodName);
		this.assertStrictlyEqual(name, foodElementId);
	}

	/**
	 * Test that game elements correctly have their width set.
	 */
	public getWidthTest(): void {
		const inky = new Inky();

		// haven't placed on board yet so width should be undefined
		this.assertOfType("number", inky.getWidth());
	}

	/**
	 * Test that game elements correctly have their height set.
	 */
	public getHeightTest(): void {
		const inky = new Inky();

		// haven't placed on board yet so height should be undefined
		this.assertOfType("number", inky.getHeight());
	}

	/**
	 * Test that game elements correctly have their center positions retrieved.
	 */
	public getCenterPositionTest(): void {
		const pacman = new PacMan();
		let centerPosition = pacman.getCenterPosition();

		// haven't placed on board yet so position should be default
		this.assertOfType("object", pacman.getCenterPosition());
		this.assertStrictlyEqual(0 + pacman.getWidth() / 2, centerPosition.x);
		this.assertStrictlyEqual(0 + pacman.getHeight() / 2, centerPosition.y);
	}

	/**
	 * Test that game elements correctly have their positions set.
	 */
	public setPositionTest(): void {
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super("test game element");
			}
		})();
		const pinkyElement = gameElement.getElement();
		let offset = 500;

		gameElement.setPosition(
			{
				x: offset,
				y: offset,
			},
			{
				modifyCss: false,
				modifyTransform: false,
			}
		);

		let position = gameElement.getPosition();
		let transform = gameElement.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		gameElement.setPosition(
			{
				x: olderOffset,
				y: olderOffset,
			},
			{
				modifyCss: true,
				modifyTransform: false,
			}
		);

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(olderOffset, position.x);
		this.assertStrictlyEqual(olderOffset, position.y);
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		gameElement.setPosition(
			{
				x: oldOffset,
				y: oldOffset,
			},
			{
				modifyCss: false,
				modifyTransform: true,
			}
		);

		position = gameElement.getPosition();
		const oldTransform = gameElement.getTransform();

		// css should not be same since not changed and transform should be equal to current transform + difference in positions
		this.assertStrictlyEqual(oldOffset, position.x);
		this.assertStrictlyEqual(oldOffset, position.y);
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(oldOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0 + (oldOffset - olderOffset), oldTransform.x);
		this.assertStrictlyEqual(0 + (oldOffset - olderOffset), oldTransform.y);

		offset = 800;

		gameElement.setPosition(
			{
				x: offset,
				y: offset,
			},
			{
				modifyCss: true,
				modifyTransform: true,
			}
		);

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should same since changed and transform should be equal to current transform + difference in positions
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(oldTransform.x + (offset - oldOffset), transform.x);
		this.assertStrictlyEqual(oldTransform.y + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that game elements correctly have their x positions set.
	 */
	public setPositionXTest(): void {
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super("test game element");
			}
		})();
		const pinkyElement = gameElement.getElement();
		let offset = 500;

		gameElement.setPositionX(offset, {
			modifyCss: false,
			modifyTransform: false,
		});

		let position = gameElement.getPosition();
		let transform = gameElement.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		gameElement.setPositionX(olderOffset, {
			modifyCss: true,
			modifyTransform: false,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(olderOffset, position.x);
		this.assertNotStrictlyEqual(olderOffset, position.y);
		this.assertNotStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		gameElement.setPositionX(oldOffset, {
			modifyCss: false,
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

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

		gameElement.setPositionX(offset, {
			modifyCss: true,
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should same since changed and transform should be equal to current transform + difference in positions
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(oldTransformX + (offset - oldOffset), transform.x);
		this.assertNotStrictlyEqual(oldTransformY + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that game elements correctly have their y positions set.
	 */
	public setPositionYTest(): void {
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super("test game element");
			}
		})();
		const pinkyElement = gameElement.getElement();
		let offset = 500;

		gameElement.setPositionY(offset, {
			modifyCss: false,
			modifyTransform: false,
		});

		let position = gameElement.getPosition();
		let transform = gameElement.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const olderOffset = 600;

		gameElement.setPositionY(olderOffset, {
			modifyCss: true,
			modifyTransform: false,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertNotStrictlyEqual(olderOffset, position.x);
		this.assertStrictlyEqual(olderOffset, position.y);
		this.assertStrictlyEqual(px(olderOffset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(olderOffset), pinkyElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		gameElement.setPositionY(oldOffset, {
			modifyCss: false,
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

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

		gameElement.setPositionY(offset, {
			modifyCss: true,
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should same since changed and transform should be equal to current transform + difference in positions
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), pinkyElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), pinkyElement.css("left"));
		this.assertNotStrictlyEqual(oldTransformX + (offset - oldOffset), transform.x);
		this.assertStrictlyEqual(oldTransformY + (offset - oldOffset), transform.y);
	}

	/**
	 * Test that game elements can be deleted properly.
	 */
	public deleteTest(): void {
		const name = "test game element";
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super(name);
			}
		})();

		get("game")!.appendChild(gameElement.getElement());

		this.assertNotNull(get(name));
		this.assertArrayContains(gameElement, App.GAME_ELEMENTS);

		gameElement.delete();

		this.assertNull(get(name));
		this.assertArrayDoesntContain(gameElement, App.GAME_ELEMENTS);
	}

	/**
	 * Test that game elements can set their css transforms properly.
	 */
	public setTransformTest(): void {
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super("test game element");
			}
		})();
		let transform = gameElement.getTransform();

		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const newTransformX = 500;
		const newTransformY = 600;

		Reflect.apply(gameElement["setTransform"], gameElement, [{ x: newTransformX, y: newTransformY }]);

		transform = gameElement.getTransform();

		this.assertStrictlyEqual(newTransformX, transform.x);
		this.assertStrictlyEqual(newTransformY, transform.y);
		this.assertStrictlyEqual(JSON.stringify({ x: newTransformX, y: newTransformY }), JSON.stringify(transform));
		this.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			gameElement.getElement().css("transform")
		);
	}

	/**
	 * Test that game elements can set their css transform x values properly.
	 */
	public setTransformXTest(): void {
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super("test game element");
			}
		})();
		const newTransformY = 600;
		let transform = gameElement.getTransform();

		Reflect.apply(gameElement["setTransformY"], gameElement, [newTransformY]);

		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(newTransformY, transform.y);

		const newTransformX = 500;

		Reflect.apply(gameElement["setTransformX"], gameElement, [newTransformX]);

		transform = gameElement.getTransform();

		this.assertStrictlyEqual(newTransformX, transform.x);
		this.assertStrictlyEqual(JSON.stringify({ x: newTransformX, y: newTransformY }), JSON.stringify(transform));
		this.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			gameElement.getElement().css("transform")
		);
	}

	/**
	 * Test that game elements can set their css transform y values properly.
	 */
	public setTransformYTest(): void {
		const gameElement = new (class extends GameElement {
			protected override readonly _width: number = 10;
			protected override readonly _height: number = 10;

			constructor() {
				super("test game element");
			}
		})();
		const newTransformX = 600;
		let transform = gameElement.getTransform();

		Reflect.apply(gameElement["setTransformX"], gameElement, [newTransformX]);

		this.assertStrictlyEqual(newTransformX, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const newTransformY = 500;

		Reflect.apply(gameElement["setTransformY"], gameElement, [newTransformY]);

		transform = gameElement.getTransform();

		this.assertStrictlyEqual(newTransformY, transform.y);
		this.assertStrictlyEqual(JSON.stringify({ x: newTransformX, y: newTransformY }), JSON.stringify(transform));
		this.assertStrictlyEqual(
			`translate(${px(newTransformX)}, ${px(newTransformY)})`,
			gameElement.getElement().css("transform")
		);
	}
}
