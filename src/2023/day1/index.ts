import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day1Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		let result = 0;
		this.input.forEach(line => {
			const digits = line.split('').map(ch => parseInt(ch)).filter(n => !isNaN(n));
			result += (digits[0] * 10) + digits[digits.length - 1];
		});
		return `${result}`;
	}

	protected solvePart2(): string {
		let result = 0;
		const digits: {[key: string]: number} = {
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4,
			'five': 5,
			'six': 6,
			'seven': 7,
			'eight': 8,
			'nine': 9,
		};
		this.input.forEach(line => {
			const numbers = [];
			for (let i = 0; i < line.length; i++) {
				if (parseInt(line[i])) {
					numbers.push(parseInt(line[i]));
				} else {
					for (const key in digits) {
						if (line.substring(i).startsWith(key)) {
							numbers.push(digits[key]);
							i += key.length - 2;
						}
					}
				}
			}
			result += (numbers[0] * 10) + numbers[numbers.length - 1];
		});
		return `${result}`;
	}
}

new Day1Solver().solveForArgs();