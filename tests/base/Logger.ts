import chalk from "chalk";

/**
 * Used to log testing messages to the node.js console.
 */
export default abstract class Logger {
	/**
	 * Orange hex color for coloring warning-logs.
	 */
	private static readonly ORANGE: string = "#FFA500";

	/**
	 * Log a testing message.
	 *
	 * @param message the message to log
	 */
	public static log(message: any): void {
		console.log(message);
	}

	/**
	 * Log a _success_ testing message.
	 *
	 * @param message the message to log
	 */
	public static logSuccess(message: any): void {
		console.log(chalk.green(message));
	}

	/**
	 * Log a _failure_ testing message.
	 *
	 * @param message the message to log
	 */
	public static logFailure(message: any): void {
		console.log(chalk.red(message));
	}

	/**
	 * Log a _warning_ testing message.
	 *
	 * @param message the message to log
	 */
	public static logWarning(message: any): void {
		console.log(chalk.hex(Logger.ORANGE)(message));
	}
}
