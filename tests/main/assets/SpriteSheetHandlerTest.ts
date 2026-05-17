import AssetRegistry from "../../../src/main/assets/AssetRegistry.ts";
import SpriteSheetHandler from "../../../src/main/assets/SpriteSheetHandler.ts";
import { GameElement } from "../../../src/main/gameelement/GameElement.ts";
import { getRandomInt, px } from "../../../src/main/utils/Utils.ts";
import Test from "../../base/Base.ts";
import { tests } from "../../base/Decorators.ts";

/**
 * Tests functionality of `src\main\board\gameelement\children\character\Character.ts` instances.
 */
@tests(SpriteSheetHandler)
export default class PacManTest extends Test {
	public testSetSpriteImage(): void {
		const gameElement = new (class extends GameElement {
			constructor() {
				super("test game element", 0, 0);
			}
		})();
		const spriteSheetHandler = new SpriteSheetHandler(gameElement);
		let x = getRandomInt(300) + 1;
		let y = getRandomInt(300) + 1;
		let width = getRandomInt(300) + 1;
		let height = getRandomInt(300) + 1;
		let offsetX = getRandomInt(300) + 1;
		let scaleByWidth = getRandomInt(300) + 1;
		const element = gameElement.getElement();
		const gameElementWidth = gameElement.getWidth();
		const gameElementHeight = gameElement.getHeight();
		let scaledWidth = scaleByWidth / width;
		let scaledHeight = gameElementHeight / height;

		// test with scaleByWidth option
		spriteSheetHandler.setSpriteImage(
			{
				x,
				y,
				width,
				height,
			},
			{
				scaleByWidth,
			},
		);

		this.assertStrictlyEqual(`url(${AssetRegistry.getImageSrc("pacman")})`, element.css("backgroundImage"));
		this.assertStrictlyEqual(`${px(scaledWidth * x)} ${px(scaledHeight * y)}`, element.css("backgroundImage"));
		this.assertStrictlyEqual(
			`${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaledWidth)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaledHeight)}`,
			element.css("backgroundSize"),
		);

		x = getRandomInt(300) + 1;
		y = getRandomInt(300) + 1;
		width = getRandomInt(300) + 1;
		height = getRandomInt(300) + 1;
		offsetX = getRandomInt(300) + 1;
		scaleByWidth = getRandomInt(300) + 1;
		let scaleByHeight = getRandomInt(300) + 1;
		scaledWidth = gameElementWidth / width;
		scaledHeight = scaleByHeight / height;

		// test with scaleByHeight option
		spriteSheetHandler.setSpriteImage(
			{
				x,
				y,
				width,
				height,
			},
			{
				scaleByHeight,
			},
		);

		scaledWidth = gameElementWidth / width;
		scaledHeight = scaleByHeight / height;

		this.assertStrictlyEqual(`url(${AssetRegistry.getImageSrc("pacman")})`, element.css("backgroundImage"));
		this.assertStrictlyEqual(`${px(scaledWidth * x)} ${px(scaledHeight * y)}`, element.css("backgroundImage"));
		this.assertStrictlyEqual(
			`${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaledWidth)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaledHeight)}`,
			element.css("backgroundSize"),
		);

		x = getRandomInt(300) + 1;
		y = getRandomInt(300) + 1;
		width = getRandomInt(300) + 1;
		height = getRandomInt(300) + 1;
		offsetX = getRandomInt(300) + 1;
		scaleByWidth = getRandomInt(300) + 1;
		scaleByHeight = getRandomInt(300) + 1;
		scaledWidth = gameElementWidth / width;
		scaledHeight = gameElementHeight / height;

		// test with offsetX option
		spriteSheetHandler.setSpriteImage(
			{
				x,
				y,
				width,
				height,
			},
			{
				offsetX,
			},
		);

		this.assertStrictlyEqual(`url(${AssetRegistry.getImageSrc("pacman")})`, element.css("backgroundImage"));
		this.assertStrictlyEqual(
			`${px(offsetX - scaledWidth * x)} ${px(scaledHeight * y)}`,
			element.css("backgroundImage"),
		);
		this.assertStrictlyEqual(
			`${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaledWidth)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaledHeight)}`,
			element.css("backgroundSize"),
		);

		x = getRandomInt(300) + 1;
		y = getRandomInt(300) + 1;
		width = getRandomInt(300) + 1;
		height = getRandomInt(300) + 1;
		offsetX = getRandomInt(300) + 1;
		let offsetY = getRandomInt(300) + 1;
		scaleByWidth = getRandomInt(300) + 1;
		scaleByHeight = getRandomInt(300) + 1;

		// test with offsetY option
		spriteSheetHandler.setSpriteImage(
			{
				x,
				y,
				width,
				height,
			},
			{
				offsetY,
			},
		);

		this.assertStrictlyEqual(`url(${AssetRegistry.getImageSrc("pacman")})`, element.css("backgroundImage"));
		this.assertStrictlyEqual(
			`${px(scaledWidth * x)} ${px(offsetY - scaledHeight * y)}`,
			element.css("backgroundImage"),
		);
		this.assertStrictlyEqual(
			`${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaledWidth)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaledHeight)}`,
			element.css("backgroundSize"),
		);

		x = getRandomInt(300) + 1;
		y = getRandomInt(300) + 1;
		width = getRandomInt(300) + 1;
		height = getRandomInt(300) + 1;
		offsetX = getRandomInt(300) + 1;
		offsetY = getRandomInt(300) + 1;
		scaleByWidth = getRandomInt(300) + 1;
		scaleByHeight = getRandomInt(300) + 1;

		// test with no options
		spriteSheetHandler.setSpriteImage({
			x,
			y,
			width,
			height,
		});

		this.assertStrictlyEqual(`url(${AssetRegistry.getImageSrc("pacman")})`, element.css("backgroundImage"));
		this.assertStrictlyEqual(`${px(scaledWidth * x)} ${px(scaledHeight * y)}`, element.css("backgroundImage"));
		this.assertStrictlyEqual(
			`${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaledWidth)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaledHeight)}`,
			element.css("backgroundSize"),
		);
	}
}
