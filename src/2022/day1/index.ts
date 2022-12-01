import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day1Solver extends Solver {
	private input: Array<Array<number>> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesInGroupsWithTransform(inputFile, (str) => parseInt(str, 10));
	}

	protected solvePart1(): string {
		let maxCalories = 0;
		this.input.forEach(group => {
			const curCalories = group.reduce((acc, cur) => acc + cur, 0);
			maxCalories = Math.max(curCalories, maxCalories);
		});

		return `${maxCalories}`;
	}

	protected solvePart2(): string {
		const calories = this.input.map(group => group.reduce((acc, cur) => acc + cur, 0));
		calories.sort((a, b) => b - a);

		return `${calories[0] + calories[1] + calories[2]}`;
	}
}

new Day1Solver().solveForArgs();