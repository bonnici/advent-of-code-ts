import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day5Solver extends Solver {
	private input = '';

	public init(inputFile: string): void {
		this.input = InputParser.readString(inputFile);
		this.verboseLog(`input ${this.input}, ${inputFile}`);
	}

	protected solvePart1(): string {
		this.verboseLog(`starting polymer ${this.input}`);
		const reacted = this.reactPolymer(this.input);

		return `${reacted.length}`;
	}

	protected solvePart2(): string {
		this.initProgress(26);
		let bestLength = null;
		for (let unitType = 'a'; unitType <= 'z'; unitType = String.fromCharCode(unitType.charCodeAt(0) + 1)) {
			const regex = new RegExp(`${unitType}`, 'gi');
			const removed = this.input.replace(regex, '');
			this.verboseLog(`Starting polymer after removing ${unitType}: ${removed}`);
			const reacted = this.reactPolymer(removed);
			this.verboseLog(`Reacted length after removing ${unitType}: ${reacted.length} (${reacted})`);

			if (bestLength === null || reacted.length < bestLength) {
				bestLength = reacted.length;
			}

			this.incrementProgress();
		}

		this.stopProgress();

		return `${bestLength}`;
	}

	private reactPolymer(polymer: string): string {
		let reacted = polymer;
		let startingSize;
		do {
			startingSize = reacted.length;

			for (let curUnit = 'a'; curUnit <= 'z'; curUnit = String.fromCharCode(curUnit.charCodeAt(0) + 1)) {
				const curRegex = new RegExp(`${curUnit}${curUnit.toUpperCase()}|${curUnit.toUpperCase()}${curUnit}`);
				reacted = reacted.replace(curRegex, '');
				// this.verboseLog(`curUnit: ${curUnit}, curRegex: ${curRegex}, polymer after replacing: ${reacted}`);
			}
		} while (reacted.length != startingSize);

		return reacted;
	}
}

new Day5Solver().solveForArgs();