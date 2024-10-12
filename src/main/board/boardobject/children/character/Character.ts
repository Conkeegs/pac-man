"use strict";

import ImageRegistry from "../../../../assets/ImageRegistry.js";
import Board from "../../../../board/Board.js";
import { CHARACTERS, TILESIZE } from "../../../../utils/Globals.js";
import { px } from "../../../../utils/Utils.js";
import type { Collidable } from "../../mixins/Collidable.js";
import MakeCollidable from "../../mixins/Collidable.js";
import Moveable, { type StartMoveOptions } from "../moveable/Moveable.js";
import MovementDirection from "../moveable/MovementDirection.js";

/**
 * A character is any of the AI or user-controlled objects on the board.
 */
export default abstract class Character extends MakeCollidable(Moveable, 50) {
	/**
	 * The path to the character's picture file.
	 */
	private readonly source: string;
	/**
	 * The id of the `setInterval()` call made for animating this character.
	 */
	private animationIntervalId: number | undefined;
	/**
	 * The minimum number of pixels away from another position on the board that this character must be to be considered "colliding".
	 */
	private collisionThreshold: number;
	/**
	 * The maximum number of different animation states this character can be in.
	 */
	abstract readonly _MAX_ANIMATION_FRAMES: number;
	/**
	 * How long each animation state for this character lasts.
	 */
	abstract readonly _ANIMATION_STATE_MILLIS: number;
	/**
	 * The current animation frame this character is on.
	 */
	abstract _animationFrame: number;
	/**
	 * Determines if the characters is currently moving.
	 */
	private moving: boolean = false;
	/**
	 * The directions that this character must be moving in order to search for the nearest "teleport" position.
	 */
	private readonly TELEPORTER_DIRECTIONS: MovementDirection[] = [MovementDirection.LEFT, MovementDirection.RIGHT];
	/**
	 * Extra amount of pixels added to each character's collision threshold to account for differing pixels a character
	 * moves on each frame.
	 */
	private static readonly COLLISION_PADDING: 0.5 = 0.5;
	/**
	 * The `x` and `y` positions on the board of each teleporter's collision.
	 */
	private readonly TELEPORTER_POSITIONS = {
		[MovementDirection.LEFT]: {
			// subtract by character's width. otherwise, when character is teleported to this left teleporter's position,
			// it will have its left-hand side placed at the start of the entrance, instead of emerging from it
			x: Board.calcTileOffsetX(1) - (TILESIZE + Board.calcTileOffset(0.5)),
			y: Board.calcTileOffsetY(18.25),
		},
		[MovementDirection.RIGHT]: {
			x: Board.calcTileOffsetX(29),
			y: Board.calcTileOffsetY(18.25),
		},
	};
	/**
	 * Holds methods which will change the character's CSS `transform` value and also set it in memory.
	 */
	private movementMethods: MovementMethods = {
		[MovementDirection.LEFT]: this.moveLeft,
		[MovementDirection.RIGHT]: this.moveRight,
		[MovementDirection.UP]: this.moveUp,
		[MovementDirection.DOWN]: this.moveDown,
	};
	/**
	 * Methods called for this character, depending on which direction they're moving, which deal with detecting collisions
	 * between other `BoardObject`s. Divide width/heights by 2 since we want `BoardObject`s to collide when they're about "half"
	 * way over each other.
	 */
	private directionalCollisionHandlers = {
		[MovementDirection.LEFT]: (collidable: Collidable) => {
			// collision with "left" side of this character
			return this.distanceWithinThreshold(
				this.getPosition()!.x,
				collidable.getPosition()!.x + collidable.getWidth()! / 2
			);
		},
		[MovementDirection.RIGHT]: (collidable: Collidable) => {
			// collision with "right" side of this character
			return this.distanceWithinThreshold(this.getPosition()!.x + this.width / 2, collidable.getPosition()!.x);
		},
		[MovementDirection.UP]: (collidable: Collidable) => {
			// collision with "top" side of this character
			return this.distanceWithinThreshold(
				this.getPosition()!.y,
				collidable.getPosition()!.y + collidable.getHeight()! / 2
			);
		},
		[MovementDirection.DOWN]: (collidable: Collidable) => {
			// collision with "bottom" side of this character
			return this.distanceWithinThreshold(this.getPosition()!.y + this.height / 2, collidable.getPosition()!.y);
		},
	};
	abstract readonly _collidableManager: CollidableManager;
	/**
	 * The key used to index into a given `Position` object, given the direction this character is moving.
	 */
	private directionalPositionKeys = {
		[MovementDirection.LEFT]: "x",
		[MovementDirection.RIGHT]: "x",
		[MovementDirection.UP]: "y",
		[MovementDirection.DOWN]: "y",
	};
	/**
	 * The proper method to set this character's position, based on the direction it is moving.
	 */
	private directionalPositionSetters = {
		[MovementDirection.LEFT]: this.setPositionX,
		[MovementDirection.RIGHT]: this.setPositionX,
		[MovementDirection.UP]: this.setPositionY,
		[MovementDirection.DOWN]: this.setPositionY,
	};
	_frameCount: number = 0;

	/**
	 * A queue of turns that a character wants to make in the future. This suggests that the character isn't
	 * within `this.collisionThreshold` pixels of the turn yet, and so must queue the turn. The length of this array
	 * must always be `1`.
	 */
	protected turnQueue: { direction: MovementDirection; turn: TurnData }[] = [];
	/**
	 * The current direction this character is currently moving in.
	 */
	protected currentDirection: MovementDirection | undefined;
	/**
	 * The last direction the user moved in.
	 */
	protected lastMoveCode: MovementDirection | undefined;
	/**
	 * Takes a given turn and a position and returns a boolean indicating whether or not the turn is "ahead" of the
	 * direction this `Character` is currently heading and if it is on the same "row"/"column" as the `Character`.
	 */
	protected turnValidators = {
		[MovementDirection.LEFT]: (turn: TurnData, position: Position) => {
			// only turns to the left of Character and in the same row
			return turn.x <= position.x + this.getWidth()! / 2 && turn.y - this.getHeight()! / 2 === position.y;
		},
		[MovementDirection.RIGHT]: (turn: TurnData, position: Position) => {
			// only turns to the right of Character and in the same row
			return turn.x >= position.x + this.getWidth()! / 2 && turn.y - this.getHeight()! / 2 === position.y;
		},
		[MovementDirection.UP]: (turn: TurnData, position: Position) => {
			// only turns above Character and in the same column
			return turn.y <= position.y + this.getHeight()! / 2 && turn.x - this.getWidth()! / 2 === position.x;
		},
		[MovementDirection.DOWN]: (turn: TurnData, position: Position) => {
			// only turns below Character and in the same column
			return turn.y >= position.y + this.getHeight()! / 2 && turn.x - this.getWidth()! / 2 === position.x;
		},
	};
	/**
	 * Takes a direction that a Character can move and returns the opposite direction of it.
	 */
	protected static readonly directionOpposites = {
		[MovementDirection.LEFT]: MovementDirection.RIGHT,
		[MovementDirection.RIGHT]: MovementDirection.LEFT,
		[MovementDirection.UP]: MovementDirection.DOWN,
		[MovementDirection.DOWN]: MovementDirection.UP,
	};

	public abstract canBeCollidedByTypes: string[];
	public override readonly width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override readonly height = TILESIZE + Board.calcTileOffset(0.5);
	/**
	 * Data telling characters where they are allowed to turn.
	 */
	public static turnData: TurnData[] | undefined;

	/**
	 * Creates a character.
	 *
	 * @param name
	 * @param speed the speed of the character (in pixels-per-second)
	 * @param source the path to the character's picture file
	 */
	constructor(name: string, speed: number, source: string) {
		super(name);

		// keep track of every character created for convenience
		CHARACTERS.push(this);

		this.speed = speed;
		this.source = source;
		// faster characters need larger collision thresholds, otherwise, their collision may never be detected since
		// their position might update "past" any colliders
		this.collisionThreshold =
			Math.ceil(speed * millisToSeconds(App.DESIRED_MS_PER_FRAME)) + Character.COLLISION_PADDING;

		this.element.css({
			width: px(this.width),
			height: px(this.height),
			backgroundImage: `url(${source})`,
		});
	}

	/**
	 * Gets this character's speed in pixels-per-second.
	 *
	 * @returns this character's speed in pixels-per-second
	 */
	public getSpeed() {
		return this.speed;
	}

	/**
	 * Gets the path to the character's picture file.
	 *
	 * @returns the path to the character's picture file
	 */
	public getSource() {
		return this.source;
	}

	/**
	 * Get what direction this character is currently moving in.
	 *
	 * @returns the current direction the character is moving in
	 */
	public getCurrentDirection(): MovementDirection | undefined {
		return this.currentDirection;
	}

	/**
	 * Gets the last direction this character moved in. This is useful, especially for pausing/unpausing, since
	 * we can use it to re-animate characters after unpausing the game.
	 *
	 * @returns the last `MovementDirection` this character moved in
	 */
	public getLastMoveCode(): MovementDirection | undefined {
		return this.lastMoveCode;
	}

	/**
	 * Determines if the character is currently moving.
	 * @returns `boolean` if the character is moving or not
	 */
	public isMoving() {
		return this.moving;
	}

	public override setPosition(position: Position, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys(position);

		super.setPosition(position, options);
	}

	public override setPositionX(x: number, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys({
			x,
			y: this.getPosition().y,
		});

		super.setPositionX(x, options);
	}

	public override setPositionY(y: number, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys({
			x: this.getPosition().x,
			y,
		});

		super.setPositionY(y, options);
	}

	/**
	 * Cancels this character's current animation frame so that `this.move()` isn't called anymore.
	 *
	 */
	public stopMoving(): boolean {
		this.dequeueTurns();
		this.lastMoveCode = undefined;
		this._frameCount = 0;

		this._collidableManager.checkForCollidableAndRemove();

		this.stopAnimation();

		this.moving = false;
		this.currentDirection = undefined;

		return false;
	}

	/**
	 * Marks this character as "moving", and will start moving in the given `MovementDirection`.
	 *
	 * @param direction the direction the character is currently trying to move in
	 * @param options options that modify the way that this character starts moving
	 */
	public startMoving(direction: MovementDirection, options?: StartMoveOptions) {
		if (this.turnQueue.length) {
			// reset turn queue each time we head in a new direction
			this.dequeueTurns();
		}

		if (this.moving) {
			this.stopMoving();
		}

		const fromTurn = options?.fromTurn;

		if (fromTurn) {
			// snap to turn-position to keep collision detection consistent
			this.offsetPositionToTurn(fromTurn);
		}

		// set this character's current direction since we now know that it's going to start moving
		this.currentDirection = direction;

		// start playing this character's animations as they move.
		this.playAnimation();

		this.moving = true;
		this.lastMoveCode = direction;
	}

	/**
	 * @inheritdoc
	 */
	public tick() {
		const position = this.getPosition();
		const direction = this.currentDirection;

		if (direction === MovementDirection.STOP) {
			this.stopMoving();

			return;
		}

		// sanity check
		if (!this.moving) {
			return;
		}

		const tileX = Board.calcTileNumX(position.x + this.width / 2);
		const tileY = Board.calcTileNumY(position.y + this.height / 2);
		let positionCollidables = COLLIDABLES_MAP[`${tileX}-${tileY}`] || [];

		// index into the collidables map, and make sure that we also look to the "left/right" and "top/bottom" of
		// this character. so, in total we look "three" tiles horizontally and vertically, depending on the direction
		// this character is moving
		if (direction === MovementDirection.LEFT || direction === MovementDirection.RIGHT) {
			const positionCollidablesRight = COLLIDABLES_MAP[`${tileX + 1}-${tileY}`];
			const positionCollidablesLeft = COLLIDABLES_MAP[`${tileX - 1}-${tileY}`];

			if (positionCollidablesRight) {
				positionCollidables = positionCollidables.concat(positionCollidablesRight);
			}

			if (positionCollidablesLeft) {
				positionCollidables = positionCollidables.concat(positionCollidablesLeft);
			}
		} else {
			const positionCollidablesUp = COLLIDABLES_MAP[`${tileX}-${tileY + 1}`];
			const positionCollidablesDown = COLLIDABLES_MAP[`${tileX}-${tileY - 1}`];

			if (positionCollidablesUp) {
				positionCollidables = positionCollidables.concat(positionCollidablesUp);
			}

			if (positionCollidablesDown) {
				positionCollidables = positionCollidables.concat(positionCollidablesDown);
			}
		}

		const numPositionCollidables = positionCollidables.length;

		if (numPositionCollidables) {
			// check for collisions between this character and other collidables
			for (let i = 0; i < numPositionCollidables; i++) {
				const collidable = positionCollidables![i]! as Collidable;

				if (
					// filter out the current board object we're operating on
					collidable.getName() === this.name ||
					// if the collided-with boardobject doesn't allow this character to collide with it, skip
					!collidable.canBeCollidedByTypes.includes(this.constructor.name)
				) {
					continue;
				}

				if (this.isCollidingWithCollidable(collidable)) {
					// want to make sure to call the collision-handling function for the collided-with object,
					// since not all Collidables call the "tick()" method and therefore will not run their
					// "_onCollision()" logic if we do not explicity call it here
					collidable._onCollision(this);
				}
			}
		}

		// check the turn queue for any queued turns
		if (this.turnQueue.length) {
			const queuedTurnInfo = this.turnQueue[0]!;
			const turn = queuedTurnInfo.turn;

			// every frame, check if the character is within the queued-turn's threshold, and turn
			// the character in that direction when it is
			if (this.isWithinTurnDistance(turn)) {
				this.startMoving(queuedTurnInfo.direction, {
					fromTurn: turn,
				});

				return;
			}
		}

		// run any custom frame-based logic that each child class implements, per-frame. make sure to check if the frame
		// update returns "true", so we can optionally break out of the tick() call
		if (this._runFrameUpdate(this._frameCount)) {
			return;
		}

		const teleporterPositions = this.TELEPORTER_POSITIONS;
		const currentDirection = this.currentDirection!;

		// if this character is moving in any direction that leads to a teleporter, keep checking if it's within range
		// of one, and teleport them when they are
		if (
			this.TELEPORTER_DIRECTIONS.includes(currentDirection) &&
			this.isWithinTeleporterDistance(teleporterPositions[currentDirection as keyof typeof teleporterPositions])
		) {
			// set character's position to the opposite teleporter
			this.setPositionX(
				teleporterPositions[
					Character.directionOpposites[
						currentDirection as keyof typeof Character.directionOpposites
					] as keyof typeof teleporterPositions
				].x,
				{
					modifyCss: false,
					modifyTransform: true,
				}
			);

			// start moving character in the same direction, again, because if we don't, the character will still have "stale" data tied to it.
			// for example, an "old" queued-turn, which was valid before the character teleported, but invalid afterwards. it could also
			// give pacman an invalid "nearestStoppingTurn", etc.
			this.startMoving(currentDirection);

			return;
		}

		this.movementMethods[direction as keyof MovementMethods].bind(this)(
			this.speed! * millisToSeconds(App.DESIRED_MS_PER_FRAME)
		);

		this._frameCount++;
	}

	/**
	 * @inheritdoc
	 */
	public interpolate(alpha: number, oldPosition: Position): void {
		const direction = this.currentDirection;
		const directionalPositionKey = this.directionalPositionKeys[
			direction as keyof typeof this.directionalPositionKeys
		] as "x" | "y";

		// interpolate to make movement smooth, and to make up for the amount of milliseconds "deltaTimeAccumulator" has
		// exceeded "MS_PER_FRAME"
		this.directionalPositionSetters[direction as keyof typeof this.directionalPositionSetters].bind(this)(
			this.getPosition()![directionalPositionKey] * alpha + oldPosition[directionalPositionKey] * (1.0 - alpha),
			{
				modifyCss: false,
				modifyTransform: true,
			}
		);
	}

	/**
	 * Sets an interval that starts playing this character's animations by referencing its different
	 * animation images.
	 */
	public playAnimation(): void {
		this.animationIntervalId = window.setInterval(
			this.updateAnimationImage.bind(this),
			this._ANIMATION_STATE_MILLIS
		);
	}

	/**
	 * Cancels the interval that changes this character's animation images.
	 */
	public stopAnimation(): void {
		clearInterval(this.animationIntervalId);
	}

	/**
	 * Deletes this character off of the game's board.
	 */
	public override delete(): void {
		CHARACTERS.splice(CHARACTERS.indexOf(this), 1);

		super.delete();
	}

	/**
	 * Returns the name of an animation-related image for the character.
	 */
	abstract _getAnimationImage(): string;

	/**
	 * Updates the character in a given frame.
	 *
	 * @param frameCount the number of frames this boardobject has been updating
	 */
	abstract _runFrameUpdate(frameCount: number): boolean;

	/**
	 * Queues a turn for a future point in time so that when the character reaches the threshold of the turn,
	 * they will turn at it.
	 *
	 * @param direction the direction the character wants to move at a future point in time
	 * @param turn the turn location the character wants to turn at in a future point in time
	 */
	protected queueTurn(direction: MovementDirection, turn: TurnData): void {
		if (this.turnQueue.length) {
			// clear the queue if we're queueing a separate turn before another ones completes
			this.dequeueTurns();
		}

		this.turnQueue.push({
			direction,
			turn,
		});
	}

	/**
	 * Determines if a character is within `this.collisionThreshold` pixels of a turn's position.
	 *
	 * @param turn the turn position to check against
	 * @returns boolean indicating if the character is within the pixel threshold of this turn
	 */
	protected isWithinTurnDistance(turn: TurnData): boolean {
		const position = this.getPosition();

		// add half of the character's width/height to the turn's x & y position so that
		// our threshold takes effect when the character is about "half" way over the turn's
		// position
		return (
			this.distanceWithinThreshold(position.x + this.width / 2, turn.x) &&
			this.distanceWithinThreshold(position.y + this.height / 2, turn.y)
		);
	}

	/**
	 * Determines if a character is within `this.collisionThreshold` pixels of a teleporter.
	 *
	 * @param position the position of the teleporter's collision
	 * @returns boolean indicating if the character is within the pixel threshold of the teleporter
	 */
	protected isWithinTeleporterDistance(teleporterPosition: Position): boolean {
		const position = this.getPosition();

		return position.y === teleporterPosition.y && this.distanceWithinThreshold(position.x, teleporterPosition.x);
	}

	/**
	 * Every turn's position only allows a certain set of directions for a `Character` to move in. This method determines
	 * if the `Character` can turn in a certain direction at the given `turn`.
	 *
	 * @param direction the direction `Character` wants to move in
	 * @param turn the turn position `Character` wants to turn at
	 * @returns boolean indicating whether the `Character` can use a given `direction` to turn at the given `turn`
	 */
	protected static canTurnWithMoveDirection(direction: MovementDirection, turn: TurnData): boolean {
		return turn.directions.includes(direction);
	}

	/**
	 * Given a turn, this function will physically "snap" this `Character`'s position to it. This is
	 * useful since collision detection relies on specific offsets of characters on the board, relative
	 * to each turn.
	 *
	 * @param turn the turn to snap this `Character`'s physical to
	 */
	protected offsetPositionToTurn(turn: TurnData): void {
		const oldPosition = this.getPosition();
		// find the "true" position x & y that the Character should be placed at when performing a turn (since
		// it could be within the turn's threshold, but not perfectly placed at the turn position)
		const characterTurnX = turn.x - this.getWidth()! / 2;
		const characterTurnY = turn.y - this.getHeight()! / 2;

		// we know at this point that we're within this turn's threshold, so correct the character's position
		// by moving it to the turn's exact location to keep the character's movement consistent
		if (oldPosition.x !== characterTurnX || oldPosition.y !== characterTurnY) {
			this.setPosition(
				{
					x: characterTurnX,
					y: characterTurnY,
				},
				{
					modifyCss: false,
					modifyTransform: true,
				}
			);
		}
	}

	/**
	 * This method will return the "closest" turn to a `Character`, based on the current direction it is moving.
	 *
	 * @returns the closest turn to this character
	 */
	protected findNearestTurn(): TurnData | undefined {
		// find turns "ahead" of character
		const filteredTurnData = Character.turnData!.filter((turn) =>
			this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](turn, this.getPosition())
		);

		const currentDirection = this.currentDirection;

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows PacMan
		// to turn (given the input moveCode), we find the closest turn to PacMan, instead of a turn that may be at the "start" of the
		// "filteredTurnData" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurnData.reverse();
		}

		return filteredTurnData[0];
	}

	/**
	 * Given a criteria, this method will return the "closest" turn to a `Character`, based on the current direction it is moving.
	 *
	 * @param filter given a turn, this function decides whether the turn falls under a specified criteria
	 * @param callback any logic to run when a turn falls under `filter`'s criteria
	 * @returns the closest turn to this character that falls under `filter`'s criteria
	 */
	protected findNearestTurnWhere(
		filter: (turn: TurnData) => boolean,
		callback?: ((turn: TurnData) => unknown) | undefined
	): TurnData | undefined {
		// find turns "ahead" of character and that fit the "filter"
		const filteredTurnData = Character.turnData!.filter((turn) => {
			if (
				this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](
					turn,
					this.getPosition()
				) &&
				filter(turn)
			) {
				// run callback if our filter passes, and it's defined
				if (callback) {
					callback(turn);
				}

				return true;
			}

			return false;
		});

		const currentDirection = this.currentDirection;

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows PacMan
		// to turn (given the input moveCode), we find the closest turn to PacMan, instead of a turn that may be at the "start" of the
		// "filteredTurnData" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurnData.reverse();
		}

		return filteredTurnData[0];
	}

	/**
	 * Determines if this character is colliding with another `BoardObject`.
	 *
	 * @param collidable the board object this character might be colliding with
	 * @returns boolean indicating if the two are colliding
	 */
	protected isCollidingWithCollidable(collidable: Collidable): boolean {
		const thisPosition = this.getPosition();
		const thisPositionX = thisPosition.x;
		const thisPositionY = thisPosition.y;
		const collidablePosition = collidable.getPosition();
		const collidableX = collidablePosition.x;
		const collidableY = collidablePosition.y;
		const currentDirection = this.currentDirection;

		// don't bother testing against board objects that aren't in the same row/column as this character
		if (
			((currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.RIGHT) &&
				Board.calcTileNumY(thisPositionY + this.height / 2) !==
					Board.calcTileNumY(collidableY + collidable.getHeight()! / 2)) ||
			((currentDirection === MovementDirection.UP || currentDirection === MovementDirection.DOWN) &&
				Board.calcTileNumX(thisPositionX + this.width / 2) !==
					Board.calcTileNumX(collidableX + collidable.getWidth()! / 2))
		) {
			return false;
		}

		return this.directionalCollisionHandlers[
			currentDirection as keyof typeof this.directionalCollisionHandlers
		].bind(this)(collidable);
	}

	/**
	 * Updates this character's animation state while it moves. This method uses the child's implementation of the `_getAnimationImage()`
	 * method, since each `Character` child should implement the `UpdatesAnimationState` interface.
	 */
	private updateAnimationImage(): void {
		this.element.css({
			backgroundImage: `url(${ImageRegistry.getImage(
				this._getAnimationImage() as keyof typeof ImageRegistry.IMAGE_LIST
			)})`,
		});
	}

	/**
	 * Determines whether two positions on the board (`x` or `y`) are within `this.collisionThreshold` pixels of
	 * each other.
	 *
	 * @param offset1 the first `x` or `y` position
	 * @param offset2 the second `x` or `y` position
	 * @returns boolean indicating if they're within the collision threshold
	 */
	private distanceWithinThreshold(offset1: number, offset2: number): boolean {
		return Math.abs(offset1 - offset2) <= this.collisionThreshold;
	}

	/**
	 * Empties the turn queue for this character.
	 */
	private dequeueTurns(): void {
		this.turnQueue = [];
	}

	abstract _onCollision(withCollidable: Collidable): void;

	/**
	 * Animates this character upwards using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character up
	 */
	private moveUp(amount: number): void {
		this.setPositionY(this.getPosition().y - amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this character downwards using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character down
	 */
	private moveDown(amount: number): void {
		this.setPositionY(this.getPosition().y + amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this character left using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character left
	 */
	private moveLeft(amount: number): void {
		this.setPositionX(this.getPosition().x - amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this character right using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character right
	 */
	private moveRight(amount: number): void {
		this.setPositionX(this.getPosition().x + amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}
}
