import { App } from "../../../../../app/App.js";
import type { AbstractConstructor } from "../../../../../types.js";
import { defined } from "../../../../../utils/Utils.js";
import Moveable from "../Moveable.js";
import MovementDirection from "../MovementDirection.js";

/**
 * A moveable that has the ability to be controlled by user-input.
 */
export type Controllable = InstanceType<ReturnType<typeof MakeControllable<typeof Moveable>>>;

/**
 * Gives a moveable the ability to be controlled by user-input.
 *
 * @param Base a moveable
 * @returns a moveable that has the ability to be controlled by user-input
 */
export default function MakeControllable<TBase extends AbstractConstructor<Moveable>>(Base: TBase) {
	abstract class ControllableClass extends Base {
		_currentInputDirection: MovementDirection | undefined;
		/**
		 * All supported keyboard keys for moving controllables, mapped to their respective movement directions.
		 */
		private static KEYCODE_DIRECTION_MAP = {
			ArrowLeft: MovementDirection.LEFT,
			KeyA: MovementDirection.LEFT,
			ArrowRight: MovementDirection.RIGHT,
			KeyD: MovementDirection.RIGHT,
			ArrowUp: MovementDirection.UP,
			KeyW: MovementDirection.UP,
			ArrowDown: MovementDirection.DOWN,
			KeyS: MovementDirection.DOWN,
			Space: MovementDirection.STOP,
		};

		/**
		 * Creates a `ControllableClass` instance.
		 *
		 * @param args arguments passed to the class's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			App.getInstance().getControllableGameElementIds().add(this.getUniqueId());
		}

		/**
		 * Gets the current `MovementDirection` this controllable should move.
		 *
		 * @returns the current `MovementDirection` this controllable should move
		 */
		public getCurrentInputDirection(): MovementDirection | undefined {
			return this._currentInputDirection;
		}

		/**
		 * Handles input from the player given from the `InputHandler`.
		 *
		 * @param currentInputCode current key code input by the player
		 */
		public handleInput(currentInputCode: string): void {
			this._currentInputDirection =
				ControllableClass.KEYCODE_DIRECTION_MAP[
					currentInputCode as keyof typeof ControllableClass.KEYCODE_DIRECTION_MAP
				];

			const currentInputDirection = this._currentInputDirection;
			const currentDirection = this.currentDirection;

			if (
				!defined(currentInputDirection) ||
				!this.isMoving() ||
				!defined(currentDirection) ||
				// ignore player trying to move in same direction they're already moving in
				currentInputDirection == currentDirection
			) {
				return;
			}

			if (
				// check if the new direction that controllable is trying to move in is the opposite of the direction
				// it is currently moving in
				currentInputDirection ==
				Moveable.directionOpposites[currentDirection as keyof typeof Moveable.directionOpposites]
			) {
				// we don't need to provide the "fromTurn" parameter here since controllable is only turning around
				// in the opposite direction instead of a 90-degree angle
				this.startMoving(currentInputDirection);

				return;
			}

			// filter down the selection of turns we have to choose from to only the ones "ahead" of this controllable
			const nearestTurnableTurn = this.findNearestTurnForDirectionWhere(
				(turn) => Moveable.canTurnWithMoveDirection(currentInputDirection, turn),
				currentDirection
			);

			if (!nearestTurnableTurn) {
				return;
			}

			// if the nearest turn allows the moveCode that the user has entered, queue the turn for the future since
			// this controllable hasn't arrived in its threshold yet
			this.queueTurn(currentInputDirection, nearestTurnableTurn);
		}

		/**
		 * Deletes this controllable.
		 */
		public override delete(): void {
			App.getInstance().getControllableGameElementIds().delete(this.getUniqueId());
			super.delete();
		}
	}

	return ControllableClass;
}
