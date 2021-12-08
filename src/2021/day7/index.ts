import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day7Solver extends Solver {
	private input: Array<number> = [];

	public init(inputFile: string): void {
		this.input = InputParser.lineToNumbers(InputParser.readLines(inputFile)[0]);
	}

	protected solvePart1(): string {
		const maxNum = Math.max(...this.input);

		let cheapest = maxNum * this.input.length;

		for (let i = 0; i <= maxNum; i++) {
			const cur = this.input.reduce((acc, cur) => acc + Math.abs(cur - i), 0);
			if (cur < cheapest) {
				cheapest = cur;
			}
		}

		return `${cheapest}`;
	}

	protected solvePart2(): string {
		const maxNum = Math.max(...this.input);

		let cheapest = Number.MAX_SAFE_INTEGER;

		this.initProgress(maxNum);

		for (let i = 0; i <= maxNum; i++) {
			const totalFuel = this.input.reduce((acc, cur) => {
				const start = Math.min(cur, i);
				const end = Math.max(cur, i);
				const fuel = this.gauss(start - start, end - start);
				this.sampleLog(`Sum of ${cur} to ${i} is ${fuel}`);
				return acc + fuel;
			}, 0);

			if (totalFuel < cheapest) {
				cheapest = totalFuel;
			}

			this.incrementProgress();
		}

		this.stopProgress();

		return `${cheapest}`;
	}

	private gauss(start: number, end: number): number {
		// https://study.com/academy/lesson/finding-the-sum-of-consecutive-numbers.html
		return ((Math.abs(end - start) + 1) / 2) * (end + start);
	}
}

new Day7Solver().solveForArgs();