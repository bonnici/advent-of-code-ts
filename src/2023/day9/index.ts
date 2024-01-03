import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day9Solver extends Solver {
	private input: Array<Array<number>> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesAsIntLists(inputFile);

		this.sampleLog('Input:');
		this.sampleLog(this.input);
	}
	
	protected solvePart1(): string {
		let result = 0;
		
		for (const line of this.input) {
			const levels = this.buildLevels(line);
			this.sampleLog(`Matrix for line ${line} is ${levels.map(l => l.join(',')).join(' | ')}`);

			let curLevel = levels.length - 1;
			let nextNumber: number | null = null;
			while (curLevel >= 0) {
				if (nextNumber !== null) {
					nextNumber = nextNumber + levels[curLevel][levels[curLevel].length - 1];
				} else {
					nextNumber = levels[curLevel][0];
				}
				curLevel--;
			}
			
			result += nextNumber || 0;
			this.sampleLog(`Result for line ${line} is ${nextNumber}, cur result is ${result}`);
		}

		return `${result}`;
	}

	protected solvePart2(): string {
		let result = 0;
		
		for (const line of this.input) {
			const levels = this.buildLevels(line);
			this.sampleLog(`Matrix for line ${line} is ${levels.map(l => l.join(',')).join(' | ')}`);

			let curLevel = levels.length - 1;
			let prevNumber: number | null = null;
			while (curLevel >= 0) {
				if (prevNumber !== null) {
					prevNumber = levels[curLevel][0] - prevNumber;
				} else {
					prevNumber = levels[curLevel][0];
				}
				curLevel--;
			}
			
			result += prevNumber || 0;
			this.sampleLog(`Result for line ${line} is ${prevNumber}, cur result is ${result}`);
		}

		return `${result}`;
	}

	private buildLevels(line: Array<number>): Array<Array<number>> {
		// Build first level array
		const levels: Array<Array<number>> = [];
		levels.push(line);

		// Build each other level by looking at the level above until all values are the same
		let curLevel = levels.length - 1;
		while (!levels[curLevel].every( v => v === levels[curLevel][0])) {
			levels.push([]);
			curLevel++;
			for (let i = 0; i < levels[curLevel - 1].length - 1; i++) {
				levels[curLevel].push(levels[curLevel - 1][i + 1] - levels[curLevel - 1][i]);
			}
		}

		return levels;
	}
}

new Day9Solver().solveForArgs();