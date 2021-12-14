import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day14Solver extends Solver {
	private polymer = '';
	private insertionRules: { [pair: string]: string} = {};
	private splitInsertionRules: { [first: string]: { [second: string]: string }} = {};
	private charCounts: { [char: string]: number } = {};
	private fillBetweenCache: Map<string, number> = new Map();

	public init(inputFile: string): void {
		const input = InputParser.readLinesInGroups(inputFile);
		this.polymer = input[0][0];
		for (const line of input[1]) {
			const split = line.split(' -> ');
			this.insertionRules[split[0]] = split[1];

			const first = split[0][0];
			const second = split[0][1];
			const reaction = split[1];
			if (!(first in this.splitInsertionRules)) {
				this.splitInsertionRules[first] = {};
			}
			this.splitInsertionRules[first][second] = reaction;

			this.charCounts[first] = 0;
			this.charCounts[second] = 0;
			this.charCounts[reaction] = 0;
		}
	}

	protected solvePart1(): string {
		this.sampleLog(this.polymer);
		this.sampleLog(this.insertionRules);

		for (let step = 1; step <= 10; step++) {
			for (let i = 0; i < this.polymer.length - 1; i++) {
				const pair = `${this.polymer[i]}${this.polymer[i+1]}`;
				if (pair in this.insertionRules) {
					this.polymer = this.polymer.slice(0, i + 1) + this.insertionRules[pair] + this.polymer.slice(i + 1);
					// this.sampleLog(`After applying ${pair} -> ${this.insertionRules[pair]}: ${this.polymer}`);
					i++;
				}
			}

			this.sampleLog(`After step ${step}: ${this.polymer}`);
		}

		const counts = new Map<string, number>();
		for (const char of this.polymer) {
			counts.set(char, (counts.get(char) || 0) + 1);
		}
		const scores = [...counts.entries()].map(([char, count]) => ({ char, count }));
		scores.sort((a, b) => a.count - b.count);

		this.sampleLog('Sorted scores', scores);

		return `${scores[scores.length - 1].count - scores[0].count}`;
	}

	protected solvePart2(): string {
		this.sampleLog(this.polymer);
		this.sampleLog(this.splitInsertionRules);
		this.sampleLog(this.charCounts);

		const maxSteps = 30;
		for (let i = 0; i < this.polymer.length - 1; i++) {
			const first = this.polymer[i];
			const second = this.polymer[i + 1];

			this.incrementCount(first);
			this.fillBetween(first, second, maxSteps);
		}

		this.incrementCount(this.polymer[this.polymer.length - 1]);

		this.sampleLog('Counts', this.charCounts);

		const scores: Array<{ char: string, count: number }> = [];
		Object.keys(this.charCounts).forEach(char => scores.push({ char, count: this.charCounts[char] }));
		scores.sort((a, b) => a.count - b.count);

		this.sampleLog('Sorted scores', scores);

		return `${scores[scores.length - 1].count - scores[0].count}`;
	}

	private fillBetween(first: string, second: string, maxSteps: number) {
		const reaction = (this.splitInsertionRules[first] || {})[second];
		if (reaction) {
			this.incrementCount(reaction);

			if (maxSteps > 1) {
				this.fillBetween(first, reaction, maxSteps - 1);
				this.fillBetween(reaction, second, maxSteps - 1);
			}
		}
	}

	private incrementCount(char: string) {
		this.charCounts[char] += 1;
	}
}

new Day14Solver().solveForArgs();