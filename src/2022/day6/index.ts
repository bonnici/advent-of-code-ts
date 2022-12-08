import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day6Solver extends Solver {
	private input = '';

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile)[0];
	}

	protected solve(length: number): string {
		const lastChars = new Map();
		
		for (let i = 0; i < length; i++) {
			const char = this.input.charAt(i);
			const existing = lastChars.get(char);
			lastChars.set(char, existing ? existing + 1 : 1);
			this.sampleLog(`Set count of ${char} to ${lastChars.get(char)}`);
		}

		for (let i = length; i < this.input.length; i++) {
			this.sampleLog(`At i=${i}, size is ${lastChars.size}`);
			if (lastChars.size === length) {
				return `${i}`;
			}

			const char = this.input.charAt(i);
			const existing = lastChars.get(char);
			lastChars.set(char, existing ? existing + 1 : 1);
			this.sampleLog(`Set count of ${char} to ${lastChars.get(char)}`);
			
			const toRemove = this.input.charAt(i - length);
			const existingToRemove = lastChars.get(toRemove);
			if (existingToRemove === 1) {
				lastChars.delete(toRemove);
				this.sampleLog(`Removed map entry for ${toRemove}`);
			} else {
				lastChars.set(toRemove, existingToRemove - 1);
				this.sampleLog(`Removed count of ${toRemove} to ${lastChars.get(toRemove)}`);
			}
		}

		return `${'unexpected'}`;
	}

	protected solvePart1(): string {
		return `${this.solve(4)}`;
	}

	protected solvePart2(): string {
		return `${this.solve(14)}`;
	}
}

new Day6Solver().solveForArgs();