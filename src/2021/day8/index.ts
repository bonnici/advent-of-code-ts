import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Segments {
	charSet: Set<string>;
	orderedChars: string;
}

interface Line {
	patterns: Array<Segments>; // will always be length 10
	outputs: Array<Segments>; // will always be length 4
}

class Day8Solver extends Solver {
	private input: Array<Line> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesWithTransform(inputFile, line => {
			const split = line.split(' | ');
			return {
				patterns: split[0].split(' ').map(p => this.stringToSegments(p)),
				outputs: split[1].split(' ').map(o => this.stringToSegments(o)),
			};
		});
	}

	private stringToSegments(input: string): Segments {
		return {
			charSet: new Set(input.split('')),
			orderedChars: input.split('').sort((a, b) => a.localeCompare(b)).join(''),
		};
	}

	protected solvePart1(): string {
		this.sampleLog(this.input[0].patterns[0]);
		this.sampleLog(this.input[0].outputs[0]);

		let result = 0;

		const validLengths = [2, 3, 4, 7];

		for (const line of this.input) {
			result += line.outputs.filter(o => validLengths.includes(o.orderedChars.length)).length;
		}

		return `${result}`;
	}

	protected solvePart2(): string {
		let sum = 0;

		for (const line of this.input) {
			const oneSegments = line.patterns.find(p => p.orderedChars.length === 2) as Segments;
			const fourSegments = line.patterns.find(p => p.orderedChars.length === 4) as Segments;
			const sevenSegments = line.patterns.find(p => p.orderedChars.length === 3) as Segments;
			const eightSegments = line.patterns.find(p => p.orderedChars.length === 7) as Segments;

			if (!oneSegments || !fourSegments || !sevenSegments || !eightSegments) {
				throw 'unexpected 1/4/7/8';
			}

			// 2, 3, and 5 each have 5 segments
			const twoThreeFiveSegments = line.patterns.filter(p => p.orderedChars.length === 5);

			// out of these, 3 is the only one that contains both segments in 1
			const threeSegments = twoThreeFiveSegments.find(s =>
				s.charSet.has(oneSegments.orderedChars[0]) && s.charSet.has(oneSegments.orderedChars[1])) as Segments;

			// removing all segments in 4 from 2 will give 3 segments, removing all segments in 4 from 5 will give 2 segments
			const twoSegments = twoThreeFiveSegments.find(s => {
				const remainingChars = new Set([...(s.charSet)].filter(x => !fourSegments.charSet.has(x)));
				return remainingChars.size === 3 && s.orderedChars !== threeSegments.orderedChars;
			}) as Segments;
			const fiveSegments = twoThreeFiveSegments.find(s => {
				const remainingChars = new Set([...(s.charSet)].filter(x => !fourSegments.charSet.has(x)));
				return remainingChars.size === 2 && s.orderedChars !== threeSegments.orderedChars;
			}) as Segments;

			if (!threeSegments || !twoSegments || !fiveSegments) {
				throw 'unexpected 2/3/5';
			}

			// 0, 6, and 9 each have 6 segments
			const zeroSixNineSegments = line.patterns.filter(p => p.orderedChars.length === 6);

			// out of these, 6 is the only one that doesn't contain both segments in 1
			const sixSegments = zeroSixNineSegments.find(s =>
				!s.charSet.has(oneSegments.orderedChars[0]) || !s.charSet.has(oneSegments.orderedChars[1])) as Segments;

			// removing all segments in 4 from 0 will give 3 segments, removing all segments in 4 from 9 will give 2 segments
			const zeroSegments = zeroSixNineSegments.find(s => {
				const remainingChars = new Set([...(s.charSet)].filter(x => !fourSegments.charSet.has(x)));
				return remainingChars.size === 3 && s.orderedChars !== sixSegments.orderedChars;
			}) as Segments;
			const nineSegments = zeroSixNineSegments.find(s => {
				const remainingChars = new Set([...(s.charSet)].filter(x => !fourSegments.charSet.has(x)));
				return remainingChars.size === 2 && s.orderedChars !== sixSegments.orderedChars;
			}) as Segments;


			if (!zeroSegments || !sixSegments || !nineSegments) {
				throw 'unexpected 0/6/9';
			}

			this.sampleLog(`0 is ${zeroSegments.orderedChars}`);
			this.sampleLog(`1 is ${oneSegments.orderedChars}`);
			this.sampleLog(`2 is ${twoSegments.orderedChars}`);
			this.sampleLog(`3 is ${threeSegments.orderedChars}`);
			this.sampleLog(`4 is ${fourSegments.orderedChars}`);
			this.sampleLog(`5 is ${fiveSegments.orderedChars}`);
			this.sampleLog(`6 is ${sixSegments.orderedChars}`);
			this.sampleLog(`7 is ${sevenSegments.orderedChars}`);
			this.sampleLog(`8 is ${eightSegments.orderedChars}`);
			this.sampleLog(`9 is ${nineSegments.orderedChars}`);

			const segments = [zeroSegments, oneSegments, twoSegments, threeSegments, fourSegments, fiveSegments, sixSegments, sevenSegments, eightSegments, nineSegments];

			let result = 0;
			for (const output of line.outputs) {
				result *= 10;
				const digit = segments.findIndex(s => s.orderedChars === output.orderedChars);
				result += digit;
			}
			this.sampleLog(`Decoded number is ${result}`);

			sum += result;

			this.sampleLog('');
		}

		return `${sum}`;
	}
}

new Day8Solver().solveForArgs();