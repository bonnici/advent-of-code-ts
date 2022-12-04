import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Row {
	firstMin: number;
	firstMax: number;
	secondMin: number;
	secondMax: number;
}

class Day4Solver extends Solver {
	private input: Array<Row> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesWithTransform(inputFile, row => {
			const split = row.split(',');
			const first = split[0].split('-');
			const second = split[1].split('-');
			return {
				firstMin: parseInt(first[0]),
				firstMax: parseInt(first[1]),
				secondMin: parseInt(second[0]),
				secondMax: parseInt(second[1]),
			};
		});
	}

	protected solvePart1(): string {
		let overlaps = 0;
		this.input.forEach(row => {
			if (
				(row.firstMin >= row.secondMin && row.firstMax <= row.secondMax) ||
				(row.secondMin >= row.firstMin && row.secondMax <= row.firstMax)
			) {
				console.log(`Fully contains row: ${row.firstMin}-${row.firstMax},${row.secondMin}-${row.secondMax}`);
				overlaps++;
			}
		});
		return `${overlaps}`;
	}

	protected solvePart2(): string {
		let overlaps = 0;
		this.input.forEach(row => {
			if (
				(row.firstMax <= row.secondMin && row.firstMin >= row.secondMax) ||
				(row.secondMax >= row.firstMin && row.secondMin <= row.firstMax)
			) {
				overlaps++;
			}
		});
		return `${overlaps}`;
	}
}

new Day4Solver().solveForArgs();