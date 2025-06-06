import Logger from "../../src/main/Logger.js";

/**
 * Decorator for test classes. Makes sure that a test class follows proper naming conventions for
 * its class name and method names.
 *
 * @param testedClassConstructor the constructor of the class to be tested
 * @returns decorator for test classes
 */
export function tests(testedClassConstructor: Function): (testClassConstructor: Function) => void {
	const testedClassConstructorName = testedClassConstructor.name;

	return function (testClassConstructor: Function) {
		const testClassConstructorName = testClassConstructor.name;

		// make sure test class name ends with "Test"
		if (!testClassConstructorName.endsWith("Test")) {
			throw new Error(`Test class ${testClassConstructorName} does not end with the word "Test"`);
		}

		// make sure test class name matches the naming of the class it is testing
		if (
			testedClassConstructorName !== testClassConstructorName.slice(0, testClassConstructorName.indexOf("Test"))
		) {
			throw new Error(
				`${testClassConstructorName} is either named incorrectly or does not test the right class: testing ${testedClassConstructorName}`
			);
		}

		const testClassConstructorPrototype = testClassConstructor.prototype;
		const testClassProperties = Object.getOwnPropertyNames(testClassConstructorPrototype).filter(
			(propertyName) => propertyName !== "constructor"
		);
		const testedClassConstructorPrototype = testedClassConstructor.prototype;
		const testedClassProperties = Object.getOwnPropertyNames(testedClassConstructor).concat(
			Object.getOwnPropertyNames(testedClassConstructorPrototype).filter(
				(propertyName) => propertyName !== "constructor"
			)
		);

		// loop through test class' method names and make sure they match the naming of the class' properties it is testing. filter
		// out constructor since it shouldn't count as a "testing" method. we also filter out testing methods starting with "create"
		// as these signify a testing method that creates an instance of a class
		for (const propertyName of testClassProperties.filter(
			(propertyName) =>
				typeof testClassConstructorPrototype[propertyName] === "function" && !propertyName.startsWith("create")
		)) {
			// make sure each testing method ends with "test"
			if (!propertyName.endsWith("Test")) {
				throw new Error(
					`${testClassConstructorName} implements invalid method ${propertyName}: method ${propertyName} does not end with the word "Test"`
				);
			}

			const testMethodTargetProperty = propertyName.slice(0, propertyName.indexOf("Test"));

			// make sure each testing method matches naming convention of class properties they are testing.filter out constructor since
			// it shouldn't be tested against (at least directly)
			if (
				testedClassProperties.findIndex(
					(propertyName) =>
						propertyName.replace("_", "").toLowerCase() === testMethodTargetProperty.toLowerCase()
				) === -1
			) {
				// throw new Error(
				// 	`${testClassConstructorName} implements invalid method ${propertyName}: ${testedClassConstructorName} does not implement property or method with naming convention "${testMethodTargetProperty}"`
				// );
			}
		}

		// look for methods defined on tested class that do not have a test written for them. make sure to
		// only look for "function" types in the tested class, and do not count debug methods
		for (const testedPropertyName of testedClassProperties.filter(
			(propertyName) =>
				typeof testedClassConstructorPrototype[propertyName] === "function" &&
				!propertyName.startsWith("debug_")
		)) {
			if (
				testClassProperties.findIndex(
					(propertyName) =>
						propertyName.slice(0, propertyName.indexOf("Test")).toLowerCase() ===
						testedPropertyName.replace("_", "").toLowerCase()
				) === -1
			) {
				Logger.log(
					`${testedClassConstructorName} has method "${testedPropertyName}" that is not tested inside of: ${testClassConstructorName}`,
					{
						severity: "warning",
						withSymbol: true,
					}
				);
			}
		}
	};
}
