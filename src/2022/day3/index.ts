import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day3Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	private priority(c: string): number {
		let priority = 0;
		if (c >= 'A' && c <= 'Z') {
			priority = 27 + (c.charCodeAt(0) - 'A'.charCodeAt(0));
		} else {
			priority = 1 + c.charCodeAt(0) - 'a'.charCodeAt(0);
		}
		this.sampleLog(`priority of ${c} is ${priority}`);
		return priority;
	}

	protected solvePart1(): string {
		let score = 0;
		this.input.forEach(line => {
			const len = line.length;
			const first = line.substring(0, len / 2);
			const second = line.substring(len / 2);
			this.sampleLog(`first: ${first}, second: ${second}`);

			const firstSet = new Set();
			[...first].forEach(c => firstSet.add(c));
			for (const c of [...second]) {
				if (firstSet.has(c)) {
					score += this.priority(c);
					break;
				}
			}
		});
		return `${score}`;
	}

	protected solvePart2(): string {
		let score = 0;
		for (let i = 0; i < this.input.length; i++) {
			const first = this.input[i++];
			const second = this.input[i++];
			const third = this.input[i];

			const firstSet = new Set();
			[...first].forEach(c => firstSet.add(c));
			const secondSet = new Set();
			[...second].forEach(c => secondSet.add(c));
			for (const c of [...third]) {
				if (firstSet.has(c) && secondSet.has(c)) {
					score += this.priority(c);
					break;
				}
			}
		}
		
		return `${score}`;
	}
}

new Day3Solver().solveForArgs();