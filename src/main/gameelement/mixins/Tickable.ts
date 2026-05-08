import type { GameElement } from "../../gameelement/GameElement.js";
import type { AbstractConstructor } from "../../types.js";

/**
 * Gives `GameElement` instances functionality that allows them to properly "tick" each frame
 * of the game.
 */
export type Tickable = InstanceType<ReturnType<typeof MakeTickable<typeof GameElement>>>;

/**
 * Gives `GameElement` instances functionality that allows it to properly "tick" each frame
 * of the game.
 *
 * @param Base a `GameElement` instance
 * @returns a `GameElement` that is considered "tickable" each frame
 */
export default function MakeTickable<TBase extends AbstractConstructor<GameElement>>(Base: TBase) {
	abstract class TickableClass extends Base {
		/**
		 * The number of times this game element has ticked so far.
		 */
		_tickCount: number = 0;
		/**
		 * Whether or not this game element should interpolate its rendering for smoothness.
		 * Useful for things like teleporters since we don't want game elements to interpolate
		 * "between" the two teleporters.
		 */
		_shouldInterpolate: boolean = true;

		/**
		 * Get whether or not this game element should interpolate.
		 *
		 * @returns whether or not this game element should interpolate
		 */
		public getShouldInterpolate(): boolean {
			return this._shouldInterpolate;
		}

		/**
		 * Set whether or not this game element should interpolate.
		 *
		 * @param shouldInterpolate whether or not this game element should interpolate
		 */
		public setShouldInterpolate(shouldInterpolate: boolean): void {
			this._shouldInterpolate = shouldInterpolate;
		}

		/**
		 * Logic to call every frame for this game element.
		 *
		 */
		public tick(): void {
			this._tickCount++;
		}

		/**
		 * Logic to call to make up for lost milliseconds each frame due to differing system deltaTimes.
		 * Blends between `newValue` and `oldValue`.
		 *
		 * @param alpha used to perform a linear interpolation between this game element's last state and current
		 * state to get the current state to render
		 * @param extraParams 0 or more optional parameters to pass each interpolation
		 */
		public interpolate(alpha: number, newValue: number, oldValue: number): number {
			return newValue * alpha + oldValue * (1.0 - alpha);
		}

		/**
		 * Deletes this tickable and makes sure that it's also removed from the tickables array.
		 */
		public override delete(): void {
			super.delete();

			this._tickCount = 0;
		}
	}

	return TickableClass;
}
