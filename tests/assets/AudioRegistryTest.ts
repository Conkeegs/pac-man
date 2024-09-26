// import AudioRegistry from "../../src/main/assets/AudioRegistry.js";
import AudioRegistry from "../../src/main/assets/AudioRegistry.js";
import Assertion from "../base/Assertion.js";
import Test from "../base/Base.js";
import { tests } from "../base/Decorators.js";

/**
 * Tests the `src\main\assets\AudioRegistry.ts` class.
 */
@tests(AudioRegistry)
export default class AudioRegistryTest extends Test {
	/**
	 * Test that each audio is of type `HTMLAudioElement` in the audio registry.
	 */
	public audioListTypesTest() {
		for (const audio of Object.values(AudioRegistry.AUDIO_LIST)) {
			Assertion.assertTrue(audio instanceof HTMLAudioElement);
		}
	}

	/**
	 * Test that each game audio file is pre-loaded into browser.
	 */
	public createAudioTest() {
		for (const eatAudioName of Object.keys(AudioRegistry.AUDIO_LIST)) {
			Assertion.assertTrue(
				Reflect.apply(AudioRegistry["createAudio"], undefined, [eatAudioName]) instanceof HTMLAudioElement
			);
		}
	}

	/**
	 * Test that we can get a path to an audio in the game.
	 */
	public getAudioTest() {
		Assertion.assertOfType("string", AudioRegistry.getAudio("food-eat-0"));
		Assertion.assertOfType("string", AudioRegistry.getAudio("food-eat-1"));
	}
}
