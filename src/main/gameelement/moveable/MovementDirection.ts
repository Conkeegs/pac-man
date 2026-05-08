/**
 * The directions any given character can move on the board.
 */
enum MovementDirection {
	/**
	 * Represents a turn in the left direction.
	 */
	LEFT,
	/**
	 * Represents a turn in the right direction.
	 */
	RIGHT,
	/**
	 * Represents a turn in the upwards direction.
	 */
	UP,
	/**
	 * Represents a turn in the downwards direction.
	 */
	DOWN,
	/**
	 * Special direction that indicates a character is going to stop moving.
	 */
	STOP,
}

export default MovementDirection;
