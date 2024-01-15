import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

export class Day12Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		let result = 0;
		
		for (const line of this.input) {
			const split = line.split(' ');
	
			const conditions = split[0];
			const counts = split[1].split(',').map(c => parseInt(c, 10));
			
			const cache: Map<string, number> = new Map();
			const lineResult = Day12Solver.countArrangementsRecursive(conditions, counts, cache);
			this.sampleLog(`Found ${lineResult} arrangements for ${conditions} and ${counts}`);
			result += lineResult;
		}

		return `${result}`;
	}

	public static countArrangementsRecursive(conditions: string, counts: number[], cache: Map<string, number>): number {
		const cacheKey = `${conditions}_${counts.join(',')}`;
		const cacheValue = cache.get(cacheKey);
		if (cacheValue !== undefined) {
			return cacheValue;
		}
		
		if (counts.length === 0) {
			// make sure there are no more #s in the conditions (which we can't satisfy)
			for (let i = 0; i < conditions.length; i++) {
				if (conditions.charAt(i) === '#') {
					cache.set(cacheKey, 0);
					return 0;
				}
			}
			cache.set(cacheKey, 1);
			return 1;
		}

		const minLength = counts.reduce((acc, cur) => acc + cur, 0) + counts.length - 1;
		if (conditions.length < minLength) {
			return 0;
		}

		if (counts.length === 1 && conditions === '?'.repeat(conditions.length)) {
			// special case - we can fit as many combinations as will fit in a sliding window
			const result = conditions.length - counts[0] + 1;
			cache.set(cacheKey, result);
			return result;
		}

		const firstChar = conditions.charAt(0);

		if (firstChar === '.') {
			let newStart = 1;
			while (newStart < conditions.length && conditions.charAt(newStart) === '.') {
				newStart++;
			}
			if (newStart === conditions.length) {
				return 0;
			} else {
				const result = this.countArrangementsRecursive(conditions.substring(newStart), counts, cache);
				cache.set(cacheKey, result);
				return result;
			}
		} else if (firstChar === '?') {
			let nextNonDot = 1;
			while (conditions.charAt(nextNonDot) === '.') {
				nextNonDot++;
			}
			let result = this.countArrangementsRecursive(`#${conditions.substring(1)}`, counts, cache);
			if (nextNonDot != conditions.length) {
				result += this.countArrangementsRecursive(`${conditions.substring(nextNonDot)}`, counts, cache);
			}
			cache.set(cacheKey, result);
			return result;
		} else if (firstChar === '#') {
			let toFit = counts[0];
			let curIndex = 0;
			while (curIndex < conditions.length && toFit > 0 && (conditions.charAt(curIndex) === '#' || conditions.charAt(curIndex) === '?')) {
				curIndex++;
				toFit--;
			}

			// if we couldn't fit it in, there are no combinations
			if (toFit > 0) {
				return 0;
			}
			// if fit it in exactly, there is a single combination
			if (curIndex === conditions.length) {
				return 1;
			}
			// if we can't fit it contiguously, there are no combinations
			if (conditions.charAt(curIndex) === '#') {
				return 0;
			}
			// otherwise, lock in the current group's arrangement and recurse
			const result = this.countArrangementsRecursive(conditions.substring(curIndex + 1), counts.slice(1), cache);
			cache.set(cacheKey, result);
			return result;
		} else {
			throw new Error(`Unexpected character ${firstChar}`);
		}
	}

	protected solvePart2(): string {
		let result = 0;
		
		for (const line of this.input) {
			const split = line.split(' ');
	
			const conditions = split[0];
			const counts = split[1].split(',').map(c => parseInt(c, 10));

			const repeatedConditions = `${conditions}?${conditions}?${conditions}?${conditions}?${conditions}`;
			const repeatedCounts = [...counts, ...counts, ...counts, ...counts, ...counts];
			
			const cache: Map<string, number> = new Map();
			const lineResult = Day12Solver.countArrangementsRecursive(repeatedConditions, repeatedCounts, cache);
			result += lineResult;
			this.sampleLog(`Found ${lineResult} arrangements for ${conditions} and ${counts}`);
		}

		return `${result}`;
	}
	

	/*
	// brute force implementation
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
	*/
}

new Day12Solver().solveForArgs(); 