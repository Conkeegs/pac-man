// #!DEBUG

import { App } from "./app/App.js";
import Board from "./board/Board.js";
import BoardText from "./board/boardobject/children/BoardText.js";
import type Moveable from "./board/boardobject/children/moveable/Moveable.js";
import type { Collidable } from "./board/boardobject/mixins/Collidable.js";
import { GameElement } from "./gameelement/GameElement.js";
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
	private static fpsCounterAccumulator: number = 0;
	private static lastVariableFrameCountDisplayed: number = 0;
	private static lastFixedFrameCountDisplayed: number = 0;
	private static variableFpsCounterText: BoardText | undefined;
	private static fixedFpsCounterText: BoardText | undefined;

	/**
	 * Get whether or not debugging in the app is enabled.
	 */
	public static isEnabled(): true | false {
		return Debugging.enabled;
	}

	/**
	 * Creates necessary text for displaying frames-per-second.
	 */
	public static enableFpsCounter(): void {
		Debugging.variableFpsCounterText = new BoardText({
			name: "variable-fps-counter",
			text: "",
		});
		Debugging.fixedFpsCounterText = new BoardText({
			name: "fixed-fps-counter",
			text: "",
		});

		App.getInstance().getBoard()?.["placeGameElement"](Debugging.variableFpsCounterText, -5, 32);
		App.getInstance().getBoard()?.["placeGameElement"](Debugging.fixedFpsCounterText, -5, 31);
	}

	/**
	 * Updates fps counter every frame.
	 *
	 * @param deltaTime time since last frame
	 * @param variableFrameCount current variable-rate frame
	 * @param fixedFrameCount current fixed-rate frame
	 */
	public static updateFpsCounter(deltaTime: number, variableFrameCount: number, fixedFrameCount: number): void {
		Debugging.fpsCounterAccumulator += deltaTime;

		if (Debugging.fpsCounterAccumulator >= 1000) {
			Debugging.variableFpsCounterText?.setText(
				`FPS(variable):${variableFrameCount - Debugging.lastVariableFrameCountDisplayed}`,
			);
			Debugging.fixedFpsCounterText?.setText(
				`FPS(fixed):${fixedFrameCount - Debugging.lastFixedFrameCountDisplayed}`,
			);

			Debugging.fpsCounterAccumulator = 0;
			Debugging.lastFixedFrameCountDisplayed = fixedFrameCount;
			Debugging.lastVariableFrameCountDisplayed = variableFrameCount;
		}
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
			// const collidable = collidables[i]!;
			collidables[i]!.getCollisionBox().getElement().css({
				border: "2px solid red",
			});
		}
	}

	/**
	 * Creates horizontal and vertical lines that form squares for each tile in debug mode.
	 */
	public static showBoardGrid() {
		const board = Board.getInstance();
		const boardElement = board.getElement();

		for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
			board["placeGameElement"](
				new BoardText({ name: `grid-vert-num-${i}`, text: i.toString(), vertical: true }),
				i,
				0,
			);

			boardElement.appendChild(
				create({ name: "div", classes: ["grid-vert"] }).css({
					left: px(left),
					height: px(HEIGHT + TILESIZE),
					zIndex: GameElement.GAME_ELEMENT_Z_INDEX + 2,
				}) as HTMLElement,
			);
		}

		for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
			// store as variable so we can use it to offset the text, based on the number of characters
			board["placeGameElement"](new BoardText({ name: `grid-horiz-num-${i}`, text: i.toString() }), 0, i);

			boardElement.appendChild(
				create({ name: "div", classes: ["grid-horiz"] }).css({
					left: px(-TILESIZE),
					top: px(top + TILESIZE),
					width: px(WIDTH + TILESIZE),
					zIndex: GameElement.GAME_ELEMENT_Z_INDEX + 2,
				}) as HTMLElement,
			);
		}
	}

	/**
	 * Enables a frame-stepping debug mode. Pressing `Backslash` toggles step mode
	 * (pausing/resuming the normal gameloop). While in step mode, pressing `ArrowRight`
	 * advances the game by one fixed-timestep frame and logs PacMan's position data
	 * to help diagnose movement issues.
	 */
	private enableFrameStepMode(): void {
		let stepMode = false;
		let stepFrame = 0;
		const app = App.getInstance();

		app.addEventListenerToElement("keydown", (event) => {
			const code = (event as KeyboardEvent).code;

			if (code === "Backslash") {
				stepMode = !stepMode;

				if (stepMode) {
					app["stopGame"](true);
					stepFrame = 0;
					console.log("[FrameStep] ON — press ArrowRight to advance one frame");
				} else {
					app["animationFrameId"] = app["startGame"]();
					console.log("[FrameStep] OFF — gameloop resumed");
				}

				return;
			}

			if (code !== "ArrowRight" || !stepMode) {
				return;
			}

			const now = performance.now();

			app["updateGame"](now - App.DESIRED_MS_PER_FRAME, now, 0, 0);

			stepFrame++;

			for (const gameElement of app["gameElementsMap"].values()) {
				if (gameElement.constructor.name !== "PacMan") {
					continue;
				}

				const pacman = gameElement as Moveable;

				console.log(`[FrameStep #${stepFrame}]`, {
					position: { ...pacman.getPosition() },
					transform: { ...pacman.getTransform() },
					direction: (pacman as unknown as { currentDirection: unknown }).currentDirection,
					isMoving: pacman.isMoving(),
					distancePerTick: pacman.getDistancePerTick(),
					deltaTimeAccumulator: app["deltaTimeAccumulator"],
				});

				break;
			}
		});
	}
}
// #!END_DEBUG
