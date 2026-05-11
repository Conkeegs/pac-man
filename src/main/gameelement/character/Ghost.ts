import { getRandomInt } from "../../utils/Utils.js";
import MovementDirection from "../moveable/MovementDirection.js";
import Character from "./Character.js";
import PacMan from "./PacMan.js";

/**
 * Represents any of the four ghosts on the board.
 */
export default abstract class Ghost extends Character {
	protected static readonly GHOST_SPRITE_DIMENSIONS: 14 = 14;

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
	 */
	constructor(name: string, speed: number) {
		super(name, speed);

		this.getElement().classList.add("ghost");

		// setTimeout(() => {
		// 	this.startMoving(MovementDirection.LEFT);
		// 	this.lookForTurn();
		// }, 2000);
	}

	/**
	 * @inheritdoc
	 */
	public override tick(): void {
		if (this._tickCount === 10) {
			this.lookForTurn();
		}

		super.tick();
	}

	private lookForTurn(): void {
		const nearestTurn = this.findNearestTurnForDirectionWhere(() => true, this.currentDirection!);

		if (nearestTurn) {
			const turnDirections = nearestTurn.getDirections();

			this.queueTurn(turnDirections[getRandomInt(turnDirections.length - 1)]!, nearestTurn);
		}
	}

	override onCollision(withCollidable: PacMan): void {
		withCollidable.stopMoving();
		withCollidable.setPosition(this.getPosition());

		console.log(`${withCollidable.getName()} has collided with ${this.getName()}`);

		this.stopMoving();
	}
}
