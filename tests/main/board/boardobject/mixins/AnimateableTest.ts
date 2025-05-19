import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import { ANIMATION_TYPE } from "../../../../../src/main/board/boardobject/mixins/Animateable.js";
import { getImageSrc } from "../../../../../src/main/utils/Utils.js";
import Test from "../../../../base/Base.js";

/**
 * Tests functionality of `Animateable` instances.
 */
export default class AnimateableTest extends Test {
	/**
	 * Test that animateables can be created correctly.
	 */
	public createAnimateableTest(): void {}

	/**
	 * Test that animateables can play their animations correctly.
	 */
	public playAnimationTest(): void {
		const animateable = new PacMan();

		this.assertOfType("undefined", animateable["_animationIntervalId"]);

		animateable.playAnimation();

		this.assertOfType("number", animateable["_animationIntervalId"]);

		animateable.stopAnimation();
	}

	/**
	 * Test that animateables can stop their animations correctly.
	 */
	public stopAnimationTest(): void {
		const animateable = new PacMan();

		this.assertOfType("undefined", animateable["_animationIntervalId"]);

		animateable.playAnimation();

		this.assertOfType("number", animateable["_animationIntervalId"]);

		animateable.stopAnimation();

		this.assertOfType("undefined", animateable["_animationIntervalId"]);
	}

	/**
	 * Test that animateables delete themselves correctly.
	 */
	public deleteTest(): void {
		const animateable = new PacMan();

		this.assertOfType("undefined", animateable["_animationIntervalId"]);

		animateable.playAnimation();

		this.assertOfType("number", animateable["_animationIntervalId"]);

		animateable.delete();

		this.assertOfType("undefined", animateable["_animationIntervalId"]);
	}

	/**
	 * Test that animateables form their default animation image names correctly.
	 */
	public defaultAnimationImageNameTest(): void {
		const animateable = new PacMan();

		this.assertStrictlyEqual(
			`${animateable.getName()}-${animateable._animationFrame}`,
			animateable.defaultAnimationImageName()
		);
	}

	/**
	 * Test that animateables form their current animation image names correctly.
	 */
	public getCurrentAnimationImageNameTest(): void {
		const animateable = new PacMan();
		const direction = MovementDirection.LEFT;

		animateable._animationFrame++;
		animateable["currentDirection"] = direction;

		this.assertStrictlyEqual(
			`${animateable.getName()}-${animateable._animationFrame}-${direction}`,
			animateable._getCurrentAnimationImageName()
		);
	}

	/**
	 * Test that animateables can update their current animation image correctly.
	 */
	public updateAnimationImageTest(): void {
		const animateable = new PacMan();
		const pacmanElement = animateable.getElement();
		const originalBackgroundImage = pacmanElement.css("backgroundImage");
		const right = MovementDirection.RIGHT;

		animateable["currentDirection"] = right;
		animateable._updateAnimationState();

		const newBackgroundImage = pacmanElement.css("backgroundImage");
		const imageName = `${animateable.getName()}-${animateable._animationFrame}-${right}`;

		this.assertNotStrictlyEqual(newBackgroundImage, originalBackgroundImage);
		this.assertStrictlyEqual(
			`url("https://localhost/projects/pac-man/${getImageSrc(imageName)}")`,
			newBackgroundImage
		);
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
