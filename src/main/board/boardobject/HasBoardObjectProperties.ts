/**
 * Indicates that a `BoardObject` instance will define certain properties that allow it to display
 * properly on the board.
 */
export default interface HasBoardObjectProperties {
	/**
	 * The calculated width property.
	 */
	width: number;
	/**
	 * The calculated height property.
	 */
	height: number;
}
