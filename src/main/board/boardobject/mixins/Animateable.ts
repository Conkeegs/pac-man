import ImageRegistry, { type IMAGE_LIST } from "../../../assets/ImageRegistry.js";
import type { AbstractConstructor } from "../../../types.js";
import { ANIMATEABLES } from "../../../utils/Globals.js";
import { defined } from "../../../utils/Utils.js";
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
	FORWARDS,
	/**
	 * Represents the backward direction of a board object's animation.
	 */
	BACKWARDS,
}

/**
 * All possible animations types that an `Animateable` can have.
 */
export enum ANIMATION_TYPE {
	/**
	 * Repeats this board object's animations from the starting frame when the max frames
	 * are reached.
	 */
	REPEAT,
	/**
	 * When this board object's max animation state is reached, it will play the animation
	 * backwards, then forwards again, looping it back and forth.
	 */
	LOOP,
}

/**
 * Gives `BoardObject` instances functionality that allows them to be animated.
 *
 * @param Base a `BoardObject` instance
 * @param animationType style in which this board object will animate
 * @returns a `BoardObject` that is going to be animated
 */
export default function MakeAnimateable<TBase extends AbstractConstructor<BoardObject>>(
	Base: TBase,
	animationType: ANIMATION_TYPE = ANIMATION_TYPE.REPEAT
) {
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
		_animationFrame: number = 1;
		/**
		 * The direction (forwards or backwards) that this board object's animation is currently playing in.
		 */
		_animationDirection: ANIMATION_DIRECTION = ANIMATION_DIRECTION.FORWARDS;
		/**
		 * Style in which this board object will animate.
		 */
		_animationType: ANIMATION_TYPE = animationType;
		/**
		 * Functions that will handle changing this board object's animation state, based
		 * on the animation type that is uses.
		 */
		_animationTypeHandlers: { [key in ANIMATION_TYPE]: () => void } = {
			[ANIMATION_TYPE.LOOP]: () => {
				const forwards = ANIMATION_DIRECTION.FORWARDS;
				const backwards = ANIMATION_DIRECTION.BACKWARDS;
				const animationDirection = this._animationDirection;

				this._animationDirection === forwards ? this._animationFrame++ : this._animationFrame--;

				// if we've reached our max animation frames and the animation is playing forwards, we need to play it backwards
				// now
				if (this._animationFrame === this._NUM_ANIMATION_STATES && animationDirection === forwards) {
					this._animationDirection = backwards;
					this._animationFrame--;
				}

				// if we've reached our lowest animation frames and the animation is playing backwards, we need to play it forwards
				// now
				if (this._animationFrame === -1 && animationDirection === backwards) {
					this._animationDirection = forwards;
					this._animationFrame++;
				}
			},
			[ANIMATION_TYPE.REPEAT]: () => {
				this._animationFrame++;

				if (this._animationFrame === this._NUM_ANIMATION_STATES) {
					this._animationFrame = 0;
				}
			},
		};

		/**
		 * Creates a `AnimateableClass` instance.
		 *
		 * @param args arguments passed to the board object's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			ANIMATEABLES.push(this as Animateable);
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
		 * Deletes this board object and makes sure that it's also removed from the animateables array.
		 */
		public override delete(): void {
			super.delete();

			ANIMATEABLES.splice(ANIMATEABLES.indexOf(this as Animateable), 1);
		}

		/**
		 * Returns a string that combines this board object's name and current animation frame so
		 * we can properly access this animateable's image in the image registry.
		 *
		 * @returns string that combines this board object's name and current animation frame
		 */
		public defaultAnimationImageName(): keyof IMAGE_LIST {
			return `${this.getName()}-${this._animationFrame}` as keyof IMAGE_LIST;
		}

		/**
		 * Returns this board object's image source-name, based on its current animation frame, and
		 * other factors in its implementation.
		 */
		_getCurrentAnimationImageName(): keyof IMAGE_LIST {
			return this.defaultAnimationImageName();
		}

		/**
		 * Updates this board object's animation state, based on its current animation image name.
		 */
		_updateAnimationImage(): void {
			this._animationTypeHandlers[this._animationType].bind(this)();

			let imageName = this._getCurrentAnimationImageName();

			// default to "not found" image if the image doesn't exist
			if (!defined(ImageRegistry.IMAGE_LIST[imageName])) {
				imageName = "not-found";
			}

			this.getElement().css({
				backgroundImage: `url(${ImageRegistry.getImage(imageName)})`,
			});
		}

		/**
		 * Set the style in which this board object will animate.
		 *
		 * @param animationType new style in which this board object will animate
		 */
		_setAnimationType(animationType: ANIMATION_TYPE): void {
			this._animationType = animationType;
		}
	}

	return AnimateableClass;
}
