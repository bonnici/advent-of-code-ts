import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day24Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		return `${'todo'}`;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
	}
}

new Day24Solver().solveForArgs();