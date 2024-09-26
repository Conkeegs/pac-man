/**
 * Used to log customized messages to the console.
 */
export default abstract class Logger {
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
		success: "green";
		failure: "red";
		warning: "orange";
		none: "white";
	} = {
		success: "green",
		failure: "red",
		warning: "orange",
		none: "white",
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
	 * Logs a message.
	 *
	 * @param message the message to log
	 * @param options options to specify the severity of the log, whether or not to log
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
			message = `${Logger.SEVERITY_UNICODE_MAP[severity]}${Logger.SPACE_UNICODE} ${message}`;
		}

		if (options.tabbed) {
			message = `${Logger.TAB_UNICODE}${message}`;
		}

		console.log(`%c ${message}`, `color: ${Logger.SEVERITY_COLOR_MAP[severity]}`);
	}
}
