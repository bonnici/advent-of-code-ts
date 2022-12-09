import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';

class Day9Solver extends Solver {
	private input: GenericGrid<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesAsCharGrid(inputFile);
		this.sampleLog(this.input.toString());
	}

	protected solvePart1(): string {

		return `${'todo'}`;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
	}
}

new Day9Solver().solveForArgs();