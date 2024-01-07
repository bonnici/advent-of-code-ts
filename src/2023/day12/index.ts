import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day12Solver extends Solver {
	private input: Array<string> = [];
	private memory: Map<string, number> = new Map();

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
		this.memory = new Map();
	}

	protected solvePart1(): string {
		let result = 0;
		
		for (const line of this.input) {
			result += this.countArrangements(line);
		}

		return `${result}`;
	}

	private countArrangements(line: string): number {
		const split = line.split(' ');

		const conditions = split[0];
		const counts = split[1];

		const regex = new RegExp(this.buildRegexString(counts));
		const numUnknowns = conditions.split('').filter(c => c === '?').length;
		const possibilities = Math.pow(2, numUnknowns);
		this.sampleLog(`${numUnknowns} unknowns for ${conditions}, ${possibilities} possible arrangements`);

		this.initProgress(possibilities);

		let arrangements = 0;
		for (let i = 0; i < possibilities; i++) {
			const binary = i.toString(2).padStart(numUnknowns, '0');
			const replacedBinary = binary.replace(/0/g, '.').replace(/1/g, '#');
			let j = 0;
			const replacedConditions = conditions.split('').map(c => c === '?' ? replacedBinary[j++] : c).join('');
			this.sampleLog(`Testing ${replacedConditions}`);
			if (regex.test(replacedConditions)) {
				arrangements++;
			}

			this.incrementProgress();
		}
		
		this.stopProgress();

		this.sampleLog(`Found ${arrangements} arrangements for ${conditions} and ${counts}`);
		return arrangements;
	}

	private buildRegexString(conditions: string): string {
		const regexParts: Array<string> = [];
		const counts = conditions.split(',').map(c => parseInt(c, 10));

		regexParts.push('^(\\.*)');
		for (const count of counts) {
			regexParts.push(`(#{${count}})`);
			regexParts.push('(\\.+)');
		}
		regexParts.pop();
		regexParts.push('(\\.*)');
		regexParts.push('$');

		const regexString = regexParts.join('');
		this.sampleLog(`Regex string for ${conditions} is ${regexString}`);

		return regexString;
	}

	protected solvePart2(): string {
		const result = 0;
		return `${result}`;
	}
}

new Day12Solver().solveForArgs();