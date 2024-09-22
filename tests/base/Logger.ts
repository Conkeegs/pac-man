import chalk, { type ChalkInstance } from "chalk";

/**
 * Used to log testing messages to the node.js console.
 */
export default abstract class Logger {
	/**
	 * Orange hex color for coloring warning-logs.
	 */
	private static readonly ORANGE: string = "#FFA500";
	/**
	 * Unicode space character for console.
	 */
	private static readonly SPACE_UNICODE: string = "\u00A0";
	/**
	 * Unicode tab character for console.
	 */
	private static readonly TAB_UNICODE: string = "\u0009";
	/**
	 * Map of logging severities to their respective colors.
	 */
	private static readonly SEVERITY_COLOR_MAP: {
		success: ChalkInstance;
		failure: ChalkInstance;
		warning: ChalkInstance;
		none: ChalkInstance;
	} = {
		success: chalk.green,
		failure: chalk.red,
		warning: chalk.hex(Logger.ORANGE),
		none: chalk.white,
	};
	/**
	 * Map of logging severities to their respective unicode symbols.
	 */
	private static readonly SEVERITY_UNICODE_MAP: {
		success: "\u2714";
		failure: "\u274C";
		warning: "\u26A0";
	} = {
		success: "\u2714",
		failure: "\u274C",
		warning: "\u26A0",
	};

	/**
	 * Logs a testing message.
	 *
	 * @param message the message to log
	 * @param options options to specify the severity of the testing log, whether or not to log
	 * it with a unicode symbol, and whether or not to indent/tab the message
	 */
	public static log(
		message: any,
		options:
			| {
					severity?: "success" | "failure" | "warning" | "none";
					withSymbol?: boolean;
					tabbed?: boolean;
			  }
			| undefined = {
			severity: "none",
			withSymbol: false,
			tabbed: false,
		}
	): void {
		const severity = options.severity || "none";

		if (options.withSymbol && severity !== "none") {
			message = `${chalk.bold(Logger.SEVERITY_UNICODE_MAP[severity])}${Logger.SPACE_UNICODE} ${message}`;
		}

		if (options.tabbed) {
			message = `${Logger.TAB_UNICODE}${message}`;
		}

		console.log(Logger.SEVERITY_COLOR_MAP[severity](message));
	}
}
