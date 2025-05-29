// #!DEBUG

import { App } from "./app/App.js";
import Board from "./board/Board.js";
import { BoardObject } from "./board/boardobject/BoardObject.js";
import BoardText from "./board/boardobject/children/BoardText.js";
import type { Collidable } from "./board/boardobject/mixins/Collidable.js";
import type { GameElement } from "./gameelement/GameElement.js";
import { COLUMNS, HEIGHT, ROWS, TILESIZE, WIDTH } from "./utils/Globals.js";
import { create, px } from "./utils/Utils.js";

// // #!DEBUG
// /**
//  * Creates circular nodes at each corner where characters can turn and also draws lines that connect these circular nodes, in debug mode.
//  */
// private async debug_createPaths() {
// 	const pathData: PathData = await fetchJSON(AssetRegistry.getJsonSrc("paths"));

// 	const nodePositions: [number, number][] = [];
// 	let pathLineIndex = 0;

// 	for (let [index, position] of Object.entries(pathData.nodes)) {
// 		this.placeBoardObject(new PathNode(`pathnode-${index}`), position.x, position.y);

// 		nodePositions.push([
// 			Board.calcTileOffset(position.x) + Board.calcTileOffset(0.5),
// 			Board.calcTileOffset(position.y) + Board.calcTileOffset(0.5),
// 		]);
// 	}

// 	for (let line of pathData.lines) {
// 		const startNode = line.startNode;

// 		for (let endNode of line.to) {
// 			let width = Math.abs(nodePositions[endNode]![0] - nodePositions[startNode]![0]);
// 			let height = Math.abs(nodePositions[endNode]![1] - nodePositions[startNode]![1]);

// 			const heightLessThan1 = height < 1;

// 			this.getElement().appendChild(
// 				create({
// 					name: "div",
// 					id: `pathline-${pathLineIndex++}`,
// 					classes: ["path-line"],
// 				}).css({
// 					width: px(width < 1 ? 1 : width),
// 					height: px(heightLessThan1 ? 1 : height),
// 					bottom: px(nodePositions[startNode]![1] - (heightLessThan1 ? 0 : height)),
// 					left: px(nodePositions[startNode]![0] - TILESIZE),
// 				}) as HTMLElement
// 			);
// 		}
// 	}
// }
// #!END_DEBUG

/**
 * Helper class for toggling common debugging utilities in the app.
 */
export default abstract class Debugging {
	/**
	 * Whether or not debugging in the app is enabled.
	 */
	private static enabled: true | false = true as const;

	/**
	 * Get whether or not debugging in the app is enabled.
	 */
	public static isEnabled(): true | false {
		return Debugging.enabled;
	}

	/**
	 * Show the collision boxes of `Collidable` instances.
	 */
	public static showHitBoxes(): void {
		const collidables: Collidable[] = [];
		const gameElementsMapValues = App.getInstance().getGameElementsMap().values();
		let currentGameElement = gameElementsMapValues.next();

		while (!currentGameElement.done) {
			const instance = currentGameElement.value;

			if (typeof instance["onCollision" as keyof GameElement] === "function") {
				collidables.push(instance as Collidable);
			}

			currentGameElement = gameElementsMapValues.next();
		}

		for (let i = 0; i < collidables.length; i++) {
			const collidable = collidables[i]!;
			const collisionBox = collidable.getCollisionBox();
			// create outlined box that is same width/height of collision box
			const collisionBoxElement = create({
				name: "div",
			}).css({
				width: px(collisionBox.getWidth()),
				height: px(collisionBox.getHeight()),
				border: "2px solid red",
				position: "absolute",
				right: 0,
				left: 0,
				top: 0,
				bottom: 0,
				margin: "auto",
			}) as HTMLElement;
			const collidableElement = collidable.getElement();
			// some collidables (like turns) may need to be displayed higher
			// since they're usually just invisible
			collidableElement.css({
				zIndex: 500,
			});
			collidableElement.appendChild(collisionBoxElement);
		}
	}

	/**
	 * Creates horizontal and vertical lines that form squares for each tile in debug mode.
	 */
	public static showBoardGrid() {
		const board = Board.getInstance();
		const boardElement = board.getElement();

		for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
			board["placeBoardObject"](
				new BoardText({ name: `grid-vert-num-${i}`, text: i.toString(), vertical: true }),
				i,
				0
			);

			boardElement.appendChild(
				create({ name: "div", classes: ["grid-vert"] }).css({
					left: px(left),
					height: px(HEIGHT + TILESIZE),
					zIndex: BoardObject.BOARD_OBJECT_Z_INDEX + 2,
				}) as HTMLElement
			);
		}

		for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
			// store as variable so we can use it to offset the text, based on the number of characters
			board["placeBoardObject"](new BoardText({ name: `grid-horiz-num-${i}`, text: i.toString() }), 0, i);

			boardElement.appendChild(
				create({ name: "div", classes: ["grid-horiz"] }).css({
					left: px(-TILESIZE),
					top: px(top + TILESIZE),
					width: px(WIDTH + TILESIZE),
					zIndex: BoardObject.BOARD_OBJECT_Z_INDEX + 2,
				}) as HTMLElement
			);
		}
	}
}
// #!END_DEBUG
