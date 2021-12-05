import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Movement {
	direction: string;
	amount: number;
}

class Day2Solver extends Solver {
	private input: Array<Movement> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile).map(line => {
			const split = line.split(' ');
			return {
				direction: split[0],
				amount: parseInt(split[1]),
			};
		});
	}

	protected solvePart1(): string {
		let horizontalPos = 0;
		let depth = 0;

		this.input.forEach(m => {
			switch (m.direction) {
			case 'forward':
				horizontalPos += m.amount;
				break;
			case 'up':
				depth -= m.amount;
				break;
			case 'down':
				depth += m.amount;
				break;
			}
		});

		return `${horizontalPos * depth}`;
	}

	protected solvePart2(): string {
		let horizontalPos = 0;
		let depth = 0;
		let aim = 0;

		this.input.forEach(m => {
			switch (m.direction) {
			case 'forward':
				horizontalPos += m.amount;
				depth += aim * m.amount;
				break;
			case 'up':
				aim -= m.amount;
				break;
			case 'down':
				aim += m.amount;
				break;
			}
		});

		return `${horizontalPos * depth}`;
	}
}

new Day2Solver().solveForArgs();
