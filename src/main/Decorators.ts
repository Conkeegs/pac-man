import Logger from "./Logger.js";
import { millisToSeconds } from "./utils/Utils.js";

/**
 * Decorator that will time any function it is applied to in milliseconds and seconds.
 *
 * @param target the target function
 * @param propertyKey name of the target function
 * @param descriptor property descriptor of target function
 * @returns property descriptor of target function
 */
export function timed(
	target: Object,
	propertyKey: string,
	descriptor: TypedPropertyDescriptor<any>
): TypedPropertyDescriptor<any> {
	const originalMethod: Function = descriptor.value;

	descriptor.value = async function () {
		const start = performance.now();

		await originalMethod.call(this);

		const end = performance.now();
		const milliseconds = end - start;
		const seconds = millisToSeconds(milliseconds / 1000);

		Logger.log(
			`Function '${propertyKey}' took ${milliseconds.toFixed(2)} milliseconds (${seconds.toFixed(
				2
			)} seconds) to run.`,
			{
				withSymbol: true,
				severity: "warning",
				tabbed: true,
			}
		);
	};

	return descriptor;
}
