import { App } from "../../../src/main/app/App.js";
import Board from "../../../src/main/board/Board.js";
import Inky from "../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../src/main/board/boardobject/children/character/PacMan.js";
import Food from "../../../src/main/board/boardobject/children/Food.js";
import { GameElement, type Position } from "../../../src/main/gameelement/GameElement.js";
import { ROWS, TILESIZE } from "../../../src/main/utils/Globals.js";
import { get, px } from "../../../src/main/utils/Utils.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

/**
 * Tests functionality of `GameElement` instances.
 */
@tests(GameElement)
export default class GameElementTest extends Test {
	/**
	 * Test that game element instances are created correctly.
	 */
	public createGameElementTest(): void {
		const pacmanName = "pacman1";
		const pacman1 = new PacMan(pacmanName);
		const gameElementsMap = App.getInstance().getGameElementsMap();
		let gameElements = gameElementsMap.values();
		let matchingGameElement: GameElement | undefined = undefined;

		for (const gameElement of gameElements) {
			if (gameElement.getName() === pacmanName) {
				matchingGameElement = gameElement;
			}
		}

		this.assertStrictlyEqual(pacmanName, pacman1.getName());
		this.assertFalse(typeof matchingGameElement === "undefined");
		this.assertTrue(pacman1.getElement().classList.contains("game-element"));
		// minus one here to account for newly-added pacman object
		this.assertStrictlyEqual(gameElementsMap.size - 1, pacman1.getUniqueId());
		this.assertTrue(gameElementsMap.has(pacman1.getUniqueId()));
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
	 * Test that a game element's unique id can be returned.
	 */
	public getUniqueIdTest(): void {
		const gameElement = new (class extends GameElement {})("test-game-element", 0, 0);
		const uniqueId = gameElement.getUniqueId();

		this.assertExists(uniqueId);
		this.assertStrictlyEqual(App.getInstance().getGameElementsMap().size, uniqueId);
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
	 * Test that game elements correctly get their width and height.
	 */
	public getDimensionsTest(): void {
		const inky = new Inky();
		const dimensions = inky.getDimensions();

		// haven't placed on board yet so height should be undefined
		this.assertOfType("number", dimensions.width);
		this.assertOfType("number", dimensions.height);
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
	 * Test that game elements can get their child-game elements.
	 */
	public getChildrenTest(): void {
		const gameElement = new (class extends GameElement {})("parent-game-element", 0, 0);

		this.assertEmpty(gameElement.getChildren());

		gameElement["addChild"]({
			offsetX: 0,
			offsetY: 0,
			gameElement: new (class extends GameElement {})("child-game-element", 0, 0),
		});

		this.assertArrayLength(1, gameElement.getChildren());
	}

	/**
	 * Test that game elements can get whether or not they are deleted.
	 */
	public getDeletedTest(): void {
		const gameElement = new (class extends GameElement {})("parent-game-element", 0, 0);

		this.assertFalse(gameElement.getDeleted());

		gameElement["deleted"] = true;

		this.assertTrue(gameElement.getDeleted());
	}

	/**
	 * Test that game elements correctly have their positions set.
	 */
	public setPositionTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const htmlElement = gameElement.getElement();
		let offset = 500;

		gameElement.setPosition(
			{
				x: offset,
				y: offset,
			},
			{
				modifyTransform: false,
			}
		);

		let position = gameElement.getPosition();
		let transform = gameElement.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
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
		this.assertStrictlyEqual(px(olderOffset), htmlElement.css("top"));
		this.assertStrictlyEqual(px(olderOffset), htmlElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		const oldOffset = 700;

		gameElement.setPosition(
			{
				x: oldOffset,
				y: oldOffset,
			},
			{
				modifyTransform: true,
			}
		);

		position = gameElement.getPosition();
		const oldTransform = gameElement.getTransform();

		// css should not be same since not changed and transform should be changed
		this.assertStrictlyEqual(oldOffset, position.x);
		this.assertStrictlyEqual(oldOffset, position.y);
		this.assertNotStrictlyEqual(px(oldOffset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(oldOffset), htmlElement.css("left"));
		this.assertStrictlyEqual(oldOffset, oldTransform.x);
		this.assertStrictlyEqual(oldOffset, oldTransform.y);

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

		// css should same since changed and transform should be changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);

		offset = 600;
		const childOffsetX = 10;
		const childOffsetY = 15;

		gameElement["addChild"]({
			offsetX: childOffsetX,
			offsetY: childOffsetY,
			gameElement: new (class extends GameElement {})("child-game-element", 0, 0),
		});
		gameElement.setPosition({
			x: offset,
			y: offset,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();
		const child = gameElement.getChildren()[0]!.gameElement;
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
	 * Test that game elements correctly have their x positions set.
	 */
	public setPositionXTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const htmlElement = gameElement.getElement();
		let offset = 500;

		gameElement.setPositionX(offset, {
			modifyTransform: false,
		});

		let position = gameElement.getPosition();
		let transform = gameElement.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		offset = 600;

		gameElement.setPositionX(offset, {
			modifyCss: true,
			modifyTransform: false,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		offset = 700;

		gameElement.setPositionX(offset, {
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should not be same since not changed and transform should be changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(offset, transform.x);
		this.assertNotStrictlyEqual(offset, transform.y);

		offset = 800;

		gameElement.setPositionX(offset, {
			modifyCss: true,
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should same since changed and transform should be changed
		this.assertStrictlyEqual(offset, position.x);
		this.assertNotStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(offset, transform.x);
		this.assertNotStrictlyEqual(offset, transform.y);

		offset = 600;
		const childOffsetX = 10;

		gameElement["addChild"]({
			offsetX: childOffsetX,
			offsetY: 0,
			gameElement: new (class extends GameElement {})("child-game-element", 0, 0),
		});
		gameElement.setPositionX(offset);

		position = gameElement.getPosition();
		transform = gameElement.getTransform();
		const child = gameElement.getChildren()[0]!.gameElement;
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
	 * Test that game elements correctly have their y positions set.
	 */
	public setPositionYTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const htmlElement = gameElement.getElement();
		let offset = 500;

		gameElement.setPositionY(offset, {
			modifyTransform: false,
		});

		let position = gameElement.getPosition();
		let transform = gameElement.getTransform();

		// css should not be same since not changed and transform should still be 0 since not changed
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		offset = 600;

		gameElement.setPositionY(offset, {
			modifyCss: true,
			modifyTransform: false,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should be same since changed and transform should still be 0 since not changed
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertStrictlyEqual(0, transform.x);
		this.assertStrictlyEqual(0, transform.y);

		offset = 700;

		gameElement.setPositionY(offset, {
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should not be same since not changed and transform should be changed
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertNotStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);

		offset = 800;

		gameElement.setPositionY(offset, {
			modifyCss: true,
			modifyTransform: true,
		});

		position = gameElement.getPosition();
		transform = gameElement.getTransform();

		// css should same since changed and transform should be changed
		this.assertNotStrictlyEqual(offset, position.x);
		this.assertStrictlyEqual(offset, position.y);
		this.assertStrictlyEqual(px(offset), htmlElement.css("top"));
		this.assertNotStrictlyEqual(px(offset), htmlElement.css("left"));
		this.assertNotStrictlyEqual(offset, transform.x);
		this.assertStrictlyEqual(offset, transform.y);

		offset = 600;
		const childOffsetY = 10;

		gameElement["addChild"]({
			offsetX: 0,
			offsetY: childOffsetY,
			gameElement: new (class extends GameElement {})("child-game-element", 0, 0),
		});
		gameElement.setPositionY(offset);

		position = gameElement.getPosition();
		transform = gameElement.getTransform();
		const child = gameElement.getChildren()[0]!.gameElement;
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
	 * Test that game elements can be deleted properly.
	 */
	public deleteTest(): void {
		const name = "test game element";
		const gameElement = new (class extends GameElement {
			constructor() {
				super(name, 0, 0);
			}
		})();

		gameElement["addChild"]({
			gameElement: new (class extends GameElement {
				constructor() {
					super("test-child", 0, 0);
				}
			})(),
		});
		get("game")!.appendChild(gameElement.getElement());

		const app = App.getInstance();

		this.assertNotNull(get(name));
		this.assertExists(app.getGameElementsMap().get(gameElement.getUniqueId()));

		gameElement.delete();

		const deletedGameElementIds = app.getDeletedGameElementIds();

		this.assertTrue(deletedGameElementIds.has(gameElement.getUniqueId()));
		this.assertTrue(deletedGameElementIds.has(gameElement.getChildren()[0]!.gameElement.getUniqueId()));
	}

	/**
	 * Test that game elements can set their css transforms properly.
	 */
	public setTransformTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
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
			constructor() {
				super("test game element", 0, 0);
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
			constructor() {
				super("test game element", 0, 0);
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

	/**
	 * Test that game element class can check if two positions are equal properly.
	 */
	public positionsEqualTest(): void {
		let position1: Position = {
			x: 300,
			y: 500,
		};
		let position2: Position = {
			x: 400,
			y: 500,
		};

		this.assertFalse(GameElement.positionsEqual(position1, position2));

		position1 = {
			x: 300,
			y: 500,
		};
		position2 = {
			x: 300,
			y: 500,
		};

		this.assertTrue(GameElement.positionsEqual(position1, position2));
	}

	/**
	 * Test that game elements can set their width correctly.
	 */
	public setWidthTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const width = 50;

		gameElement["setWidth"](width);

		this.assertStrictlyEqual(width, gameElement.getWidth());
	}

	/**
	 * Test that game elements can set their height correctly.
	 */
	public setHeightTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const height = 50;

		gameElement["setHeight"](height);

		this.assertStrictlyEqual(height, gameElement.getHeight());
	}

	/**
	 * Test that game elements can set their dimensions correctly.
	 */
	public setDimensionsTest(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const width = 50;
		const height = 50;

		gameElement["setDimensions"](width, height);

		this.assertStrictlyEqual(width, gameElement.getWidth());
		this.assertStrictlyEqual(height, gameElement.getHeight());
	}

	/**
	 * Test that game element can add child-game elements.
	 */
	public addChildTest(): void {
		const gameElement = new (class extends GameElement {})("parent-game-element", 0, 0);
		const childGameElement = new (class extends GameElement {})("child-game-element", 0, 0);
		const offsetX = 9;
		const offsetY = 11;

		gameElement["addChild"]({
			offsetX,
			offsetY,
			gameElement: childGameElement,
		});

		const children = gameElement.getChildren();
		const firstChild = children[0]!;

		this.assertArrayLength(1, children);
		this.assertStrictlyEqual(offsetX, firstChild.offsetX);
		this.assertStrictlyEqual(offsetY, firstChild.offsetY);
		this.assertStrictlyEqual(childGameElement, firstChild.gameElement);
	}
}
