export function binaryStringToDecimal(input: string): number {
	// Using bigint so we can do shift operators on numbers greater than 32 bit
	let result = BigInt(0);
	for (let i = 0; i < input.length; i++) {
		result <<= BigInt(1);
		if (input.charAt(i) === '1') {
			result += BigInt(1);
		}
	}

	return Number(result);
}

export function hexStringToBinaryString(input: string): string {
	// very inefficient way to do it but whatever
	let result = '';
	for (let i = 0; i < input.length; i++) {
		const hex = input.charAt(i);
		switch (hex) {
		case '0':
			result += '0000';
			break;
		case '1':
			result += '0001';
			break;
		case '2':
			result += '0010';
			break;
		case '3':
			result += '0011';
			break;
		case '4':
			result += '0100';
			break;
		case '5':
			result += '0101';
			break;
		case '6':
			result += '0110';
			break;
		case '7':
			result += '0111';
			break;
		case '8':
			result += '1000';
			break;
		case '9':
			result += '1001';
			break;
		case 'A':
			result += '1010';
			break;
		case 'B':
			result += '1011';
			break;
		case 'C':
			result += '1100';
			break;
		case 'D':
			result += '1101';
			break;
		case 'E':
			result += '1110';
			break;
		case 'F':
			result += '1111';
			break;
		default:
			throw 'Invalid character';
		}
	}

	return result;
}

export function factorial(num: number): number {
	if (num == 0) return 1;
	else return num * factorial(num - 1);
}