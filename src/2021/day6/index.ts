import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day6Solver extends Solver {
	private input: Array<number> = [];

	public init(inputFile: string): void {
		this.input = InputParser.lineToNumbers(InputParser.readLines(inputFile)[0]);
	}

	protected solvePart1(): string {
		this.sampleLog('input', this.input);

		const timers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (const num of this.input) {
			timers[num]++;
		}

		this.sampleLog('timers', timers);

		for (let day = 1; day <= 80; day++) {
			const newSpawns = timers.shift() || 0;
			timers[6] += newSpawns;
			timers.push(newSpawns);
		}

		const numFish = timers.reduce((acc, cur) => acc + cur, 0);
		return `${numFish}`;
	}

	protected solvePart2(): string {
		const timers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (const num of this.input) {
			timers[num]++;
		}

		for (let day = 1; day <= 256; day++) {
			const newSpawns = timers.shift() || 0;
			timers[6] += newSpawns;
			timers.push(newSpawns);
		}

		const numFish = timers.reduce((acc, cur) => acc + cur, 0);
		return `${numFish}`;
	}
}

new Day6Solver().solveForArgs();