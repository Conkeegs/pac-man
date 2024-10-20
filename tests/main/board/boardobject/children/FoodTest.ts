import { App } from "../../../../../src/main/App.js";
import type { Position } from "../../../../../src/main/board/Board.js";
import Food from "../../../../../src/main/board/boardobject/children/Food.js";
import { TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { hexToRgb, px } from "../../../../../src/main/utils/Utils.js";
import Test from "../../../../base/Base.js";
import { tests } from "../../../../base/Decorators.js";

/**
 * Tests functionality of `Food` instances.
 */
@tests(Food)
export default class FoodTest extends Test {
	/**
	 * Test that food can be created correctly.
	 */
	public createFoodTest(): void {
		const foodName = "test-food";
		const food = new Food(foodName);
		const foodElement = food.getElement();

		this.assertStrictlyEqual(px(TILESIZE), foodElement.css("width"));
		this.assertStrictlyEqual(px(TILESIZE), foodElement.css("height"));
		this.assertStrictlyEqual("transparent", foodElement.css("backgroundColor"));

		let foodElementChild: HTMLDivElement | null = foodElement.firstElementChild as HTMLDivElement;

		this.assertNotNull(foodElementChild);

		foodElementChild = foodElementChild!;

		this.assertStrictlyEqual(foodName, foodElementChild.id);
		this.assertTrue(foodElementChild.classList.contains("food"));
		this.assertStrictlyEqual(px(TILESIZE / 4), foodElementChild.css("width"));
		this.assertStrictlyEqual(px(TILESIZE / 4), foodElementChild.css("height"));
		this.assertStrictlyEqual(hexToRgb(Food.BACKGROUND_COLOR), foodElementChild.css("backgroundColor"));
	}

	/**
	 * Test that food behaves properly when collided with.
	 */
	public async onCollisionTest(): Promise<void> {
		const food = new Food("test-food");
		let position: Position = { x: 500, y: 700 };

		food.setPosition(position);

		this.assertArrayContains(food, App.COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
		this.assertFalse(Food["audioFlag"]);

		food._onCollision();

		await this.assertPropertyChanges(true, Food, "audioFlag");
		this.assertArrayDoesntContain(food, App.COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
	}
}
