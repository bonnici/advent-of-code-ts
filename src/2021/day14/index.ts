import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

type CharCounts = { [char: string]: number };

class Day14Solver extends Solver {
	private polymer = '';
	private insertionRules: { [pair: string]: string} = {};
	private splitInsertionRules: { [first: string]: { [second: string]: string }} = {};
	private inBetweenCache: { [first: string]: { [second: string]: { [level: number]: CharCounts | null } }} = {};
	private defaultCharCounts: CharCounts = {};
	private allChars: Set<string> = new Set();

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

			this.allChars.add(first);
			this.allChars.add(second);
			this.allChars.add(reaction);
		}

		// Part 2 solution only works if there aren't too many chars
		if (this.allChars.size > 10) {
			throw 'Too many chars';
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

		const depth = 40;
		this.initInBetweenCache(depth);
		this.sampleLog(this.inBetweenCache);

		const charCounts: CharCounts = JSON.parse(JSON.stringify(this.defaultCharCounts));

		for (let i = 0; i < this.polymer.length - 1; i++) {
			const first = this.polymer[i];
			const second = this.polymer[i + 1];

			charCounts[first] += 1;
			const betweenCounts = this.fillBetween(first, second, depth);
			Object.keys(betweenCounts).forEach(c => charCounts[c] += betweenCounts[c]);
		}

		charCounts[this.polymer[this.polymer.length - 1]] += 1;

		this.sampleLog('Counts', charCounts);

		const scores: Array<{ char: string, count: number }> = [];
		Object.keys(charCounts).forEach(char => scores.push({ char, count: charCounts[char] }));
		scores.sort((a, b) => a.count - b.count);

		this.sampleLog('Sorted scores', scores);

		return `${scores[scores.length - 1].count - scores[0].count}`;
	}

	private fillBetween(first: string, second: string, maxSteps: number): CharCounts {
		const cache = this.inBetweenCache[first][second][maxSteps];
		if (cache !== null) {
			// this.sampleLog(`Cache hit at ${first}, ${second}, ${maxSteps}`);
			return cache;
		}

		const charCounts = JSON.parse(JSON.stringify(this.defaultCharCounts));

		const reaction = (this.splitInsertionRules[first] || {})[second];
		if (reaction) {
			charCounts[reaction] += 1;

			if (maxSteps > 1) {
				const firstCharCounts = this.fillBetween(first, reaction, maxSteps - 1);
				const secondCharCounts = this.fillBetween(reaction, second, maxSteps - 1);

				Object.keys(firstCharCounts).forEach(c => charCounts[c] += firstCharCounts[c]);
				Object.keys(secondCharCounts).forEach(c => charCounts[c] += secondCharCounts[c]);
			}
		}

		this.inBetweenCache[first][second][maxSteps] = charCounts;
		return charCounts;
	}

	// Set up cache to hold character counts for all reactions going down to the maximum depth
	private initInBetweenCache(maxDepth: number) {
		for (const first of this.allChars.values()) {
			this.defaultCharCounts[first] = 0;

			this.inBetweenCache[first] = {};
			for (const second of this.allChars.values()) {
				this.inBetweenCache[first][second] = {};
				for (let depth = 1; depth <= maxDepth; depth++) {
					this.inBetweenCache[first][second][depth] = null;
				}
			}
		}
	}
}

new Day14Solver().solveForArgs();