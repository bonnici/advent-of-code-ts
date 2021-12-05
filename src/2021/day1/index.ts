import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day1Solver extends Solver {
	private input: Array<any> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesAsInts(inputFile);
	}

	protected solvePart1(): string {
		let lastValue: number | null = null;
		let increaseCount = 0;

		for (const cur of this.input) {
			if (lastValue !== null && cur > lastValue) {
				increaseCount++;
			}
			lastValue = cur;
		}

		return `${increaseCount}`;
	}

	protected solvePart2(): string {
		let lastValue: number | null = null;
		let increaseCount = 0;

		for (let i = 2; i < this.input.length; i++) {
			const curSum = this.input[i] + this.input[i-1] + this.input[i-2];
			if (lastValue !== null && curSum > lastValue) {
				increaseCount++;
			}
			lastValue = curSum;
		}

		return `${increaseCount}`;
	}
}

new Day1Solver().solveForArgs();
