export function binaryStringToDecimal(input: string): number {
	let result = 0;
	for (let i = 0; i < input.length; i++) {
		result <<= 1;
		if (input.charAt(i) === '1') {
			result += 1;
		}
	}

	return result;
}
