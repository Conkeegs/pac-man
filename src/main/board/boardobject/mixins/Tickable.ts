import { App } from "../../../App.js";
import type { AbstractConstructor } from "../../../types.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Gives `BoardObject` instances functionality that allows them to properly "tick" each frame
 * of the game.
 */
export type Tickable = InstanceType<ReturnType<typeof MakeTickable<typeof BoardObject>>>;

/**
 * Gives `BoardObject` instances functionality that allows it to properly "tick" each frame
 * of the game.
 *
 * @param Base a `BoardObject` instance
 * @returns a `BoardObject` that is considered "tickable" each frame
 */
export default function MakeTickable<TBase extends AbstractConstructor<BoardObject>>(Base: TBase) {
	abstract class TickableClass extends Base {
		/**
		 * The number of frames this board object has been updating (separate from the total frames that
		 * the game has been running).
		 */
		_framesUpdating: number = 0;
		/**
		 * Whether or not this board object should interpolate its rendering for smoothness.
		 * Useful for things like teleporters since we don't want board objects to interpolate
		 * "between" the two teleporters.
		 */
		_shouldInterpolate: boolean = true;

		/**
		 * Creates a `TickableClass` instance.
		 *
		 * @param args arguments passed to the board object's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			App.TICKABLES.push(this as Tickable);
		}

		/**
		 * Get whether or not this board object should interpolate.
		 *
		 * @returns whether or not this board object should interpolate
		 */
		public getShouldInterpolate(): boolean {
			return this._shouldInterpolate;
		}

		/**
		 * Set whether or not this board object should interpolate.
		 *
		 * @param shouloInterpolate whether or not this board object should interpolate
		 */
		public setShouldInterpolate(shouloInterpolate: boolean): void {
			this._shouldInterpolate = shouloInterpolate;
		}

		/**
		 * Logic to call every frame for this board object.
		 *
		 */
		public tick(): void {
			this._framesUpdating++;
		}

		/**
		 * Logic to call to make up for lost milliseconds each frame due to differing system deltaTimes.
		 *
		 * @param alpha used to perform a linear interpolation between this board object's last state and current
		 * state to get the current state to render
		 * @param extraParams 0 or more optional parameters to pass each interpolation
		 */
		public abstract interpolate(alpha: number, ...extraParams: any[]): void;

		/**
		 * Deletes this tickable and makes sure that it's also removed from the tickables array.
		 */
		public override delete(): void {
			super.delete();

			this._framesUpdating = 0;

			App.TICKABLES.splice(App.TICKABLES.indexOf(this as unknown as Tickable), 1);
		}
	}

	return TickableClass;
}
