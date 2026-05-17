import { App } from "../../../../src/main/app/App.js";
import AssetRegistry from "../../../../src/main/assets/AssetRegistry.js";
import PacMan from "../../../../src/main/gameelement/character/PacMan.js";
import { ANIMATION_DEFAULT_SET_NAME, ANIMATION_TYPE } from "../../../../src/main/gameelement/mixins/Animateable.js";
import MovementDirection from "../../../../src/main/gameelement/moveable/MovementDirection.js";
import { px } from "../../../../src/main/utils/Utils.js";
import Test from "../../../base/Base.js";

/**
 * Tests functionality of `Animateable` instances.
 */
export default class AnimateableTest extends Test {
	/**
	 * Test that animateables can be created correctly.
	 */
	public createAnimateableTest(): void {}

	/**
	 * Test getter for current animation state is correct.
	 */
	public getAnimationStateTest(): void {
		const animateable = new PacMan();

		animateable.setCurrentAnimationSet(0);

		this.assertStrictlyEqual(1, animateable.getAnimationState());

		animateable["_animationTypeHandlers"][ANIMATION_TYPE.LOOP].bind(animateable)();

		this.assertStrictlyEqual(2, animateable.getAnimationState());
	}

	/**
	 * Test getter for current animation state set is correct.
	 */
	public getCurrentAnimationSetTest(): void {
		const animateable = new PacMan();

		this.assertStrictlyEqual("default", animateable.getCurrentAnimationSet());

		const direction = MovementDirection.RIGHT;

		animateable.setCurrentDirection(direction);

		this.assertStrictlyEqual(direction, animateable.getCurrentAnimationSet());
	}

	/**
	 * Test animateables can change their current animation context/set.
	 */
	public setCurrentAnimationSetTest(): void {
		const animateable = new PacMan();

		this.assertStrictlyEqual(ANIMATION_DEFAULT_SET_NAME, animateable.getCurrentAnimationSet());

		const animationSet = 1;

		animateable.setCurrentAnimationSet(animationSet);

		this.assertStrictlyEqual(animationSet, animateable.getCurrentAnimationSet());
	}

	/**
	 * Test that animateables can play their animations correctly.
	 */
	public playAnimationTest(): void {
		const animateable = new PacMan();
		const app = App.getInstance();

		this.assertEmpty(app["animatingGameElementIds"]);

		animateable.playAnimation();

		this.assertNotEmpty(app["animatingGameElementIds"]);

		animateable.stopAnimation();
	}

	/**
	 * Test that animateables can stop their animations correctly.
	 */
	public stopAnimationTest(): void {
		const animateable = new PacMan();

		animateable["_deltaTimeAccumulator"] = 100;

		animateable.playAnimation();
		animateable.stopAnimation();

		this.assertStrictlyEqual(0, animateable["_deltaTimeAccumulator"]);
		this.assertEmpty(App.getInstance()["animatingGameElementIds"]);
	}

	/**
	 * Test that animateables delete themselves correctly.
	 */
	public deleteTest(): void {
		const animateable = new PacMan();

		animateable.playAnimation();

		this.assertNotEmpty(App.getInstance()["animatingGameElementIds"]);

		animateable.delete();

		this.assertEmpty(App.getInstance()["animatingGameElementIds"]);
	}

	/**
	 * Test animateables can reset their animation state.
	 */
	public resetAnimationStateTest(): void {
		const animateable = new PacMan();

		animateable["_currentAnimationSet"] = 1;

		animateable.updateAnimationState();
		animateable.resetAnimationState();

		this.assertStrictlyEqual(ANIMATION_DEFAULT_SET_NAME, animateable["_currentAnimationSet"]);
		this.assertStrictlyEqual(1, animateable["_animationState"]);
		this.assertTrue(animateable["_needsSpriteUpdate"]);
	}

	/**
	 * Test that animateables render their animation css changes.
	 */
	public renderTest(): void {
		const animateable = new PacMan();

		animateable.render();

		const element = animateable.getElement();

		// if sprite does not need to be updated, no render change should happen
		this.assertFalse(animateable["_needsSpriteUpdate"]);

		animateable["_needsSpriteUpdate"] = true;
		// set invalid animation state so background animationState not found
		animateable["_animationState"] = 0;

		animateable.render();

		this.assertFalse(animateable["_needsSpriteUpdate"]);
		this.assertStrictlyEqual(`url(\"${AssetRegistry.getImageSrc("not-found")}\")`, element.css("backgroundImage"));

		animateable["_needsSpriteUpdate"] = true;
		animateable["_animationState"] = 1;

		// valid animation state should correctly scale/set* background image
		const animationState =
			animateable._ANIMATION_STATE_SETS[
				animateable["_currentAnimationSet"] as keyof typeof animateable._ANIMATION_STATE_SETS
			]![0]!;
		const width = animationState.width;
		const height = animationState.height;
		// calculate scale factor based on varying dimensions of
		// game elements
		const scaleX = animateable.getWidth() / width;
		const scaleY = animateable.getHeight() / height;

		animateable.render();

		this.assertFalse(animateable["_needsSpriteUpdate"]);
		this.assertStrictlyEqual(`url(\"${AssetRegistry.getImageSrc("pacman")}\")`, element.css("backgroundImage"));
		this.assertStrictlyEqual(
			`${px(Number((0 - scaleX * animationState.x).toPrecision(6)))} ${px(Number((0 - scaleY * animationState.y).toPrecision(6)))}`,
			element.css("backgroundPosition"),
		);
	}

	public advanceAnimationTest(): void {
		const animateable = new PacMan();

		// if last timestamp is falsy, it should not advance
		animateable.advanceAnimation(50, 0);

		this.assertStrictlyEqual(0, animateable["_deltaTimeAccumulator"]);
		this.assertFalse(animateable["_needsSpriteUpdate"]);

		// accumulator value will not be greater than millis of animation here
		// so should not update animation state
		animateable.advanceAnimation(100, 90);

		this.assertStrictlyEqual(10, animateable["_deltaTimeAccumulator"]);
		this.assertFalse(animateable["_needsSpriteUpdate"]);

		// should update animation since accumulator now over threshold
		animateable.advanceAnimation(100, 20);

		this.assertStrictlyEqual(0, animateable["_deltaTimeAccumulator"]);
		this.assertTrue(animateable["_needsSpriteUpdate"]);
	}

	public updateAnimationStateTest(): void {
		const animateable = new PacMan();

		animateable.setCurrentAnimationSet(0);
		animateable.updateAnimationState();

		this.assertStrictlyEqual(2, animateable["_animationState"]);
		this.assertTrue(animateable["_needsSpriteUpdate"]);
		this.assertTrue(animateable["shouldRender"]);
	}

	/**
	 * Test that animateables can set their animation type correctly.
	 */
	public setAnimationTypeTest(): void {
		const animateable = new PacMan();

		this.assertStrictlyEqual(ANIMATION_TYPE.LOOP, animateable._animationType);

		animateable._setAnimationType(ANIMATION_TYPE.REPEAT);

		this.assertStrictlyEqual(ANIMATION_TYPE.REPEAT, animateable._animationType);
	}
}
