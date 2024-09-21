export default class TestException extends Error {
	constructor(message: string) {
		super(message);

		this.name = "TestException";
	}
}
