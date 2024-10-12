import type { Position } from "../../../../../src/main/board/Board.js";
import Food from "../../../../../src/main/board/boardobject/children/Food.js";
import { COLLIDABLES_MAP, TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { hexToRgb, px } from "../../../../../src/main/utils/Utils.js";
import Assertion from "../../../../base/Assertion.js";
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

		Assertion.assertStrictlyEqual(px(TILESIZE), foodElement.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE), foodElement.css("height"));
		Assertion.assertStrictlyEqual("transparent", foodElement.css("backgroundColor"));

		let foodElementChild: HTMLDivElement | null = foodElement.firstElementChild as HTMLDivElement;

		Assertion.assertNotNull(foodElementChild);

		foodElementChild = foodElementChild!;

		Assertion.assertStrictlyEqual(foodName, foodElementChild.id);
		Assertion.assertTrue(foodElementChild.classList.contains("food"));
		Assertion.assertStrictlyEqual(px(TILESIZE / 4), foodElementChild.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE / 4), foodElementChild.css("height"));
		Assertion.assertStrictlyEqual(hexToRgb(Food.BACKGROUND_COLOR), foodElementChild.css("backgroundColor"));
	}

	/**
	 * Test that food can set its position correctly.
	 */
	public setPositionTest(): void {
		const food = new Food("test-food");
		const position: Position = { x: 500, y: 700 };

		food.setPosition(position);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);

		Assertion.assertStrictlyEqual(position, food.getPosition());
	}

	/**
	 * Test that food can set its x position correctly.
	 */
	public setPositionXTest(): void {
		const food = new Food("test-food");
		let position: Position = { x: 500, y: 700 };

		food.setPosition(position);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(position, food.getPosition());

		const newPositionX = 800;

		food.setPositionX(newPositionX);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(newPositionX, food.getPosition().x);
	}

	/**
	 * Test that food can set its y position correctly.
	 */
	public setPositionYTest(): void {
		const food = new Food("test-food");
		let position: Position = { x: 500, y: 700 };

		food.setPosition(position);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(position, food.getPosition());

		const newPositionY = 900;

		food.setPositionY(newPositionY);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(newPositionY, food.getPosition().y);
	}

	/**
	 * Test that food can delete itself correctly.
	 */
	public deleteTest(): void {
		const food = new Food("test-food");
		let position: Position = { x: 500, y: 700 };

		food.setPosition(position);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);

		food.delete();

		Assertion.assertArrayDoesntContain(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
	}

	/**
	 * Test that food behaves properly when collided with.
	 */
	public async onCollisionTest(): Promise<void> {
		const food = new Food("test-food");
		let position: Position = { x: 500, y: 700 };

		food.setPosition(position);

		Assertion.assertArrayContains(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
		Assertion.assertFalse(Food["audioFlag"]);

		food._onCollision();

		await Assertion.assertPropertyChanges(true, Food, "audioFlag");
		Assertion.assertArrayDoesntContain(food, COLLIDABLES_MAP[food["getCollidablePositionKey"]()]!);
	}
}
