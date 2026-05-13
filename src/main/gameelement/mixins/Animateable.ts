import { App } from "../../app/App.js";
import SpriteSheetHandler from "../../assets/SpriteSheetHandler.js";
import type { GameElement } from "../../gameelement/GameElement.js";
import type { AbstractConstructor } from "../../types.js";

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
 * An animation state that a game element can be in at any given time.
 * The information it provides gives the sprite sheet handler the data it
 * needs to find the offset and dimensions of a sprite.
 */
export type AnimationState = {
	/**
	 * The x offset of this animation state in the sprite sheet.
	 */
	x: number;
	/**
	 * The y offset of this animation state in the sprite sheet.
	 */
	y: number;
	/**
	 * The width of this animation state in the sprite sheet.
	 */
	width: number;
	/**
	 * The height of this animation state in the sprite sheet.
	 */
	height: number;
};
/**
 * Map of keyed animation states for a game element. Used to define
 * animation states for different context. For example, moveables
 * define them based on the direction they're traveling in.
 */
export type AnimationStateMap = {
	/**
	 * Default key that must be defined for all animation sets.
	 */
	default: ReadonlyArray<AnimationState>;
	[stateType: string | number]: ReadonlyArray<AnimationState>;
};

/**
 * Default key name for an animation set.
 */
export const ANIMATION_DEFAULT_SET_NAME: "default" = "default";

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
		 * The current animation set currently being rendered for this game element.
		 */
		_currentAnimationSet: string | number = ANIMATION_DEFAULT_SET_NAME;
		/**
		 * All animation states for this game element, keyed by type of animation.
		 * Must be defined in the implementation of the class.
		 */
		abstract readonly _ANIMATION_STATE_SETS: AnimationStateMap;
		/**
		 * How long each animation state for this game element lasts.
		 * Must be defined in the implementation of the class.
		 */
		_ANIMATION_STATE_MILLIS: number = 100;
		/**
		 * The current animation state this game element is in.
		 */
		_animationState: number = 1;
		/**
		 * The direction (forwards or backwards) that this game element's animation is currently playing in.
		 */
		_animationDirection: ANIMATION_DIRECTION = ANIMATION_DIRECTION.FORWARDS;
		/**
		 * Style in which this game element will animate.
		 */
		_animationType: ANIMATION_TYPE = animationType;
		/**
		 * Accumulates milliseconds passed each frame of the game in order to
		 * keep track of when to animate/change sprites.
		 */
		_deltaTimeAccumulator: number = 0;
		/**
		 * Sprite sheet handler instance for this game element.
		 */
		_spriteSheetHandler: SpriteSheetHandler;
		/**
		 * Whether or not this game element should have its sprite updated for
		 * animation.
		 */
		_needsSpriteUpdate: boolean = false;
		/**
		 * Functions that will handle changing this game element's animation state, based
		 * on the animation type that is uses.
		 */
		_animationTypeHandlers: { [key in ANIMATION_TYPE]: () => void } = {
			[ANIMATION_TYPE.LOOP]: () => {
				const forwards = ANIMATION_DIRECTION.FORWARDS;
				const backwards = ANIMATION_DIRECTION.BACKWARDS;
				const animationDirection = this._animationDirection;

				this._animationDirection === forwards ? this._animationState++ : this._animationState--;

				// if we've reached our max animation frames and the animation is playing forwards, we need to play it backwards
				// now
				if (
					this._animationState === this._ANIMATION_STATE_SETS[this._currentAnimationSet]!.length + 1 &&
					animationDirection === forwards
				) {
					this._animationDirection = backwards;
					this._animationState -= 2;
				}

				// if we've reached our lowest animation frames and the animation is playing backwards, we need to play it forwards
				// now
				if (this._animationState === 0 && animationDirection === backwards) {
					this._animationDirection = forwards;
					this._animationState += 1;
				}
			},
			[ANIMATION_TYPE.REPEAT]: () => {
				if (this._animationState === this._ANIMATION_STATE_SETS[this._currentAnimationSet]!.length) {
					this._animationState = 1;

					return;
				}

				this._animationState++;
			},
		};

		/**
		 * Creates a `AnimateableClass` instance.
		 *
		 * @param args arguments passed to the game element's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			this._spriteSheetHandler = new SpriteSheetHandler(this);
			this._currentAnimationSet = ANIMATION_DEFAULT_SET_NAME;

			this.getElement().classList.add("animateable");
		}

		/**
		 * Get current animation state this game element is in.
		 *
		 * @returns number indicating current animation state this game element is in
		 */
		public getAnimationState(): number {
			return this._animationState;
		}

		/**
		 * Get current animation set this game element is animating in.
		 *
		 * @returns string or number indicating current animation set this game element is animating in
		 */
		public getCurrentAnimationSet(): string | number {
			return this._currentAnimationSet;
		}

		/**
		 * Mark this animateable for animation and add it to current-animating list.
		 */
		public playAnimation(): void {
			App.getInstance().getAnimatingGameElementIds().add(this.getUniqueId());
		}

		/**
		 * Stop animating this animatable and remove it from current-animating list.
		 */
		public stopAnimation(): void {
			this._deltaTimeAccumulator = 0;

			App.getInstance().getAnimatingGameElementIds().delete(this.getUniqueId());
		}

		/**
		 * Deletes this game element and makes sure that it's also removed from the animateables array.
		 */
		public override delete(): void {
			this.stopAnimation();

			super.delete();
			App.getInstance().getAnimatingGameElementIds().delete(this.getUniqueId());
		}

		/**
		 * Reset this animateable's state to its default state.
		 */
		public resetAnimationState(): void {
			this._currentAnimationSet = ANIMATION_DEFAULT_SET_NAME;
			this._animationState = 1;
			this._needsSpriteUpdate = true;

			this.queueRenderUpdate();
		}

		/**
		 * Render this animateable's css changes.
		 */
		public override render(): void {
			super.render();

			// very important to check the sprite update flag here because it's
			// possible that this animateable could be an instance that renders
			// very often, like a moveable, so calling "setSpriteImage()" every
			// frame would be costly and causes some jitter in movements
			if (this._needsSpriteUpdate) {
				this._spriteSheetHandler.setSpriteImage(this._animationState - 1);

				this._needsSpriteUpdate = false;
			}
		}

		/**
		 * Advance this animateable's animation.
		 *
		 * @param gameLoopTimestamp current millisecond timestamp in main gameloop
		 * @param lastGameLoopTimestamp last millisecond timestamp from gameloop's previous frame
		 */
		public advanceAnimation(gameLoopTimestamp: number, lastGameLoopTimestamp: number): void {
			if (!lastGameLoopTimestamp) {
				return;
			}

			this._deltaTimeAccumulator += gameLoopTimestamp - lastGameLoopTimestamp;

			// if we've reached the threshold of this animateable's millis-per-state
			if (this._deltaTimeAccumulator >= this._ANIMATION_STATE_MILLIS) {
				this.updateAnimationState();

				this._deltaTimeAccumulator = 0;
			}
		}

		/**
		 * Updates this game element's animation state, based on its current animation frame number.
		 */
		public updateAnimationState(): void {
			this._animationTypeHandlers[this._animationType].bind(this)();

			this._needsSpriteUpdate = true;

			this.queueRenderUpdate();
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
