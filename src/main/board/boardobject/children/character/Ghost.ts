import type { IMAGE_LIST } from "../../../../assets/ImageRegistry.js";
import { getRandomInt } from "../../../../utils/Utils.js";
import Character from "./Character.js";
import PacMan from "./PacMan.js";

/**
 * Represents any of the four ghosts on the board.
 */
export default abstract class Ghost extends Character {
	/**
	 * @inheritdoc
	 */
	override readonly _NUM_ANIMATION_STATES: 2 = 2;
	/**
	 * @inheritdoc
	 */
	override readonly _ANIMATION_STATE_MILLIS: 100 = 100;

	public override canBeCollidedByTypes: string[] = [PacMan.name];

	/**
	 * Creates a `Ghost`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);


		this.element.classList.add("ghost");
	}

	/**
	 * Gets the name of the image file relating to this ghost's current animation frame and direction.
	 *
	 * @returns the name of the image file relating to this ghost's current animation frame and direction
	 */
	override _getCurrentAnimationImageName(): keyof IMAGE_LIST {
		this._animationFrame++;

		if (this._animationFrame === this._NUM_ANIMATION_STATES) {
			this._animationFrame = 0;
		}

		return `${this.defaultAnimationImageName()}-${this.currentDirection}` as keyof IMAGE_LIST;
	}

	override _onCollision(withCollidable: PacMan): void {
		withCollidable.stopMoving();

		console.log(`${withCollidable.getName()} has collided with ${this.getName()}`);

		this.stopMoving();
	}
}
