import { getRandomInt } from "../../../../utils/Utils.js";
import type { Collidable } from "../../mixins/Collidable.js";
import Character from "./Character.js";
import PacMan from "./PacMan.js";

/**
 * Represents any of the four ghosts on the board.
 */
export default abstract class Ghost extends Character {
	protected override _collisionHandlers = {
		[PacMan.name]: (collidable: Collidable) => {
			(collidable as PacMan).stopMoving();

			console.log(`${(collidable as PacMan).getName()} has collided with ${this.getName()}`);

			this.stopMoving();
		},
	};

	/**
	 * @inheritdoc
	 */
	override readonly _NUM_ANIMATION_STATES: 2 = 2;
	/**
	 * @inheritdoc
	 */
	override readonly _ANIMATION_STATE_MILLIS: 100 = 100;

	/**
	 * Creates a `Ghost`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);

		this.getElement().classList.add("ghost");

		setTimeout(() => {
			// this.startMoving(MovementDirection.LEFT);
			// this.lookForTurn();
		}, 2000);
	}

	/**
	 * @inheritdoc
	 */
	public override tick(): void {
		if (this._framesUpdating === 10) {
			this.lookForTurn();
		}

		super.tick();
	}

	private lookForTurn(): void {
		const nearestTurn = this.findNearestTurn();

		if (nearestTurn) {
			const turnDirections = nearestTurn.directions;

			this.queueTurn(turnDirections[getRandomInt(turnDirections.length - 1)]!, nearestTurn);
		}
	}
}
