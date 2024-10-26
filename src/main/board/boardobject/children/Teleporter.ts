import { TILESIZE } from "../../../utils/Globals.js";
import { px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";
import MakeCollidable, { type Collidable } from "../mixins/Collidable.js";
import PacMan from "./character/PacMan.js";
import type Moveable from "./moveable/Moveable.js";
import MovementDirection from "./moveable/MovementDirection.js";

/**
 * Represents a teleporter that is usable by `Moveable` board objects.
 */
export default class Teleporter extends MakeCollidable(BoardObject) {
	protected override readonly _width: number = TILESIZE;
	protected override readonly _height = TILESIZE;

	/**
	 * The direction that the moveable (that is teleporting) will continue to move
	 * after it has teleported.
	 */
	private teleportDirection: MovementDirection;
	/**
	 * The teleporter to teleport to from this teleporter.
	 */
	private linkedTeleporter: Teleporter | undefined;

	/**
	 * @inheritdoc
	 */
	public override canBeCollidedByTypes: string[] = [PacMan.name];

	/**
	 * The directions that this board object must be moving in order to search for the nearest "teleport" position.
	 */
	private static readonly TELEPORTER_DIRECTIONS: MovementDirection[] = [
		MovementDirection.LEFT,
		MovementDirection.RIGHT,
	];

	/**
	 * Create a teleporter instance.
	 *
	 * @param name unique name and HTML id of teleporter
	 * @param teleportDirection direction that the moveable (that is teleporting) will continue to move
	 * after it has teleported
	 */
	constructor(name: string, teleportDirection: MovementDirection) {
		super(name);

		this.teleportDirection = teleportDirection;

		this.getElement().css({
			width: px(this._width),
			height: px(this._height),
		});
	}

	/**
	 * Get direction that the moveable (that is teleporting) will continue to move
	 * after it has teleported for this teleporter.
	 */
	public getTeleportDirection(): MovementDirection {
		return this.teleportDirection;
	}

	/**
	 * Links this teleporter to another teleporter so that they may be teleport `Moveable`
	 * board objects to each other.
	 *
	 * @param teleporter the teleporter to link to
	 */
	public link(teleporter: Teleporter): void {
		this.linkedTeleporter = teleporter;
	}

	/**
	 * @inheritdoc
	 */
	public override _onCollision(collidableMoveable: Moveable & Collidable): void {
		const linkedTeleporter = this.linkedTeleporter;
		const currentDirection = collidableMoveable.getCurrentDirection()!;

		if (!linkedTeleporter || !Teleporter.TELEPORTER_DIRECTIONS.includes(currentDirection)) {
			return;
		}

		const linkedTeleporterPosition = linkedTeleporter.getPosition();
		const teleporterWidth = this.getWidth();
		let teleportX: number = linkedTeleporterPosition.x;

		// want to offset moveable's position by teleporter's width so that app doesn't detect
		// collisions between moveable and teleporter and infinitely teleport the moveable back and
		// forth
		switch (linkedTeleporter.getTeleportDirection()) {
			case MovementDirection.LEFT:
				teleportX -= teleporterWidth;

				break;
			case MovementDirection.RIGHT:
				teleportX += teleporterWidth;

				break;
		}

		collidableMoveable.setPosition(
			{
				x: teleportX,
				y: linkedTeleporterPosition.y,
			},
			{
				modifyTransform: true,
			}
		);

		// start moving board object in the same direction, again, because if we don't, the board object will still have "stale" data tied to it.
		// for example, an "old" queued-turn, which was valid before the board object teleported, but invalid afterwards. it could also
		// give pacman an invalid "nearestStoppingTurn", etc.
		collidableMoveable.startMoving(currentDirection);
	}
}
