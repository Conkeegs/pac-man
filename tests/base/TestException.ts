/**
 * Exception thrown when testing errors occur.
 */
export default class TestException extends Error {
	constructor(message: string) {
		super(message);

		this.name = TestException.name;
	}
}
