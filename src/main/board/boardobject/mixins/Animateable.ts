import { App } from "../../../app/App.js";
import AssetRegistry, { type ASSET_LIST } from "../../../assets/AssetRegistry.js";
import type { GameElement } from "../../../gameelement/GameElement.js";
import type { AbstractConstructor } from "../../../types.js";
import { defined } from "../../../utils/Utils.js";

/**
 * Gives `GameElement` instances functionality that allows them to be animated.
 */
export type Animateable = InstanceType<ReturnType<typeof MakeAnimateable<typeof GameElement>>>;

/**
 * The possible directions that a game element's animation can play in.
 */
export enum ANIMATION_DIRECTION {
	/**
	 * Represents the forward direction of a game element's animation.
	 */
	FORWARDS,
	/**
	 * Represents the backward direction of a game element's animation.
	 */
	BACKWARDS,
}

/**
 * All possible animations types that an `Animateable` can have.
 */
export enum ANIMATION_TYPE {
	/**
	 * Repeats this game element's animations from the starting frame when the max frames
	 * are reached.
	 */
	REPEAT,
	/**
	 * When this game element's max animation state is reached, it will play the animation
	 * backwards, then forwards again, looping it back and forth.
	 */
	LOOP,
}

/**
 * Gives `GameElement` instances functionality that allows them to be animated.
 *
 * @param Base a `GameElement` instance
 * @param animationType style in which this game element will animate
 * @returns a `GameElement` that is going to be animated
 */
export default function MakeAnimateable<TBase extends AbstractConstructor<GameElement>>(
	Base: TBase,
	animationType: ANIMATION_TYPE = ANIMATION_TYPE.REPEAT,
) {
	abstract class AnimateableClass extends Base {
		/**
		 * The id of the `setInterval()` call made for animating this game element.
		 */
		_animationIntervalId: number | undefined;
		/**
		 * The maximum number of different animation states this game element can be in.
		 */
		abstract readonly _NUM_ANIMATION_STATES: number;
		/**
		 * How long each animation state for this game element lasts.
		 */
		_ANIMATION_STATE_MILLIS: number = 100;
		/**
		 * The current animation frame this game element is on.
		 */
		_animationFrame: number = 1;
		/**
		 * The direction (forwards or backwards) that this game element's animation is currently playing in.
		 */
		_animationDirection: ANIMATION_DIRECTION = ANIMATION_DIRECTION.FORWARDS;
		/**
		 * Style in which this game element will animate.
		 */
		_animationType: ANIMATION_TYPE = animationType;
		/**
		 * Functions that will handle changing this game element's animation state, based
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
				if (this._animationFrame === this._NUM_ANIMATION_STATES + 1 && animationDirection === forwards) {
					this._animationDirection = backwards;
					this._animationFrame -= 2;
				}

				// if we've reached our lowest animation frames and the animation is playing backwards, we need to play it forwards
				// now
				if (this._animationFrame === 0 && animationDirection === backwards) {
					this._animationDirection = forwards;
					this._animationFrame += 1;
				}
			},
			[ANIMATION_TYPE.REPEAT]: () => {
				if (this._animationFrame === this._NUM_ANIMATION_STATES) {
					this._animationFrame = 1;

					return;
				}

				this._animationFrame++;
			},
		};

		/**
		 * Creates a `AnimateableClass` instance.
		 *
		 * @param args arguments passed to the game element's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			App.getInstance().getAnimateableGameElementIds().add(this.getUniqueId());
		}

		/**
		 * Sets an interval that starts playing this game element's animations by referencing its different
		 * animation images.
		 */
		public playAnimation(): void {
			if (this._animationIntervalId) {
				this.stopAnimation();
			}

			this._animationIntervalId = window.setInterval(
				this._updateAnimationState.bind(this),
				this._ANIMATION_STATE_MILLIS,
			);
		}

		/**
		 * Cancels the interval that changes this game element 's animation images.
		 */
		public stopAnimation(): void {
			clearInterval(this._animationIntervalId);

			this._animationIntervalId = undefined;
		}

		/**
		 * Deletes this game element and makes sure that it's also removed from the animateables array.
		 */
		public override delete(): void {
			this.stopAnimation();

			super.delete();
			App.getInstance().getAnimateableGameElementIds().delete(this.getUniqueId());
		}

		/**
		 * Returns a string that combines this game element's name and current animation frame so
		 * we can properly access this animateable's image in the image registry.
		 *
		 * @returns string that combines this game element's name and current animation frame
		 */
		public defaultAnimationImageName(): keyof ASSET_LIST["image"] {
			return `${this.getName()}-${this._animationFrame}` as keyof ASSET_LIST["image"];
		}

		/**
		 * Sets this animateable's CSS `background-image`.
		 *
		 * @param imageName the image to set this animateable's CSS `background-image` to. defaults
		 * to value returned from `defaultAnimationImageName()`
		 */
		public updateAnimationImage(imageName?: keyof ASSET_LIST["image"]): void {
			this.getElement().css({
				backgroundImage: `url(${AssetRegistry.getImageSrc(imageName ?? this._getCurrentAnimationImageName())})`,
			});
		}

		/**
		 * Returns this game element's image source-name, based on its current animation frame, and
		 * other factors in its implementation.
		 */
		_getCurrentAnimationImageName(): keyof ASSET_LIST["image"] {
			return this.defaultAnimationImageName();
		}

		/**
		 * Updates this game element's animation state, based on its current animation image name.
		 */
		_updateAnimationState(): void {
			this._animationTypeHandlers[this._animationType].bind(this)();

			let imageName = this._getCurrentAnimationImageName();

			// default to "not found" image if the image doesn't exist
			if (!defined(AssetRegistry.ASSET_LIST["image"][imageName])) {
				imageName = "not-found";
			}

			this.updateAnimationImage(imageName);
		}

		/**
		 * Set the style in which this game element will animate.
		 *
		 * @param animationType new style in which this game element will animate
		 */
		_setAnimationType(animationType: ANIMATION_TYPE): void {
			this._animationType = animationType;
		}
	}

	return AnimateableClass;
}
