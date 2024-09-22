/**
 * Pluralizes `word` based on `count`;
 *
 * @param word the word to pluralize (or not)
 * @param count the number to base the pluralization on
 */
export function pluralize(word: string, count: number): string {
	if (count === 0 || count > 1) {
		return `${word}s`;
	}

	return word;
}
