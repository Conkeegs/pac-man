import ImageRegistry, { type IMAGE_LIST } from "../../../assets/ImageRegistry.js";
import type { AbstractConstructor } from "../../../types.js";
import { ANIMATEABLES } from "../../../utils/Globals.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Gives `BoardObject` instances functionality that allows them to be animated.
 */
export type Animateable = InstanceType<ReturnType<typeof MakeAnimateable<typeof BoardObject>>>;

/**
 * The possible directions that a board object's animation can play in.
 */
export enum ANIMATION_DIRECTION {
	/**
	 * Represents the forward direction of a board object's animation.
	 */
	FORWARDS = 0,
	/**
	 * Represents the backward direction of a board object's animation.
	 */
	BACKWARDS = 1,
}

/**
 * Gives `BoardObject` instances functionality that allows them to be animated.
 *
 * @param Base a `BoardObject` instance
 * @returns a `BoardObject` that is going to be animated
 */
export default function MakeAnimateable<TBase extends AbstractConstructor>(Base: TBase) {
	abstract class AnimateableClass extends Base {
		/**
		 * The id of the `setInterval()` call made for animating this board object.
		 */
		_animationIntervalId: number | undefined;
		/**
		 * The maximum number of different animation states this board object can be in.
		 */
		abstract readonly _NUM_ANIMATION_STATES: number;
		/**
		 * How long each animation state for this board object lasts.
		 */
		_ANIMATION_STATE_MILLIS: number = 100;
		/**
		 * The current animation frame this board object is on.
		 */
		_animationFrame: number = 0;
		/**
		 * The direction (forwards or backwards) that pacman's animation is currently playing in.
		 */
		_animationDirection: ANIMATION_DIRECTION = ANIMATION_DIRECTION.FORWARDS;

		/**
		 * Creates a `AnimateableClass` instance.
		 *
		 * @param args arguments passed to the board object's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			ANIMATEABLES.push(this as unknown as Animateable);
		}

		/**
		 * Sets an interval that starts playing this board object's animations by referencing its different
		 * animation images.
		 */
		public playAnimation(): void {
			if (this._animationIntervalId) {
				this.stopAnimation();
			}

			this._animationIntervalId = window.setInterval(
				this._updateAnimationImage.bind(this),
				this._ANIMATION_STATE_MILLIS
			);
		}

		/**
		 * Cancels the interval that changes this board object 's animation images.
		 */
		public stopAnimation(): void {
			clearInterval(this._animationIntervalId);

			this._animationIntervalId = undefined;
		}

		/**
		 * Returns this board object's image source-name, based on its current animation frame.
		 */
		abstract _getCurrentAnimationImageName(): keyof IMAGE_LIST;

		/**
		 * Updates this board object's animation state, based on its current animation image source.
		 */
		_updateAnimationImage(): void {
			(this as unknown as BoardObject).getElement().css({
				backgroundImage: `url(${ImageRegistry.getImage(this._getCurrentAnimationImageName())})`,
			});
		}

		/**
		 * Deletes this board object and makes sure that it's also removed from the animateables array.
		 */
		public delete(): void {
			(super["delete" as keyof {}] as BoardObject["delete"])();

			ANIMATEABLES.splice(ANIMATEABLES.indexOf(this as unknown as Animateable), 1);
		}
	}

	return AnimateableClass;
}
