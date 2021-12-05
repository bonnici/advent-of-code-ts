import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import {binaryStringToDecimal} from '../../common/Utils';

class Day3Solver extends Solver {
	private input: Array<Array<string>> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesWithTransform(inputFile, line => line.split(''));
	}

	protected solvePart1(): string {
		const mostCommonBits = [];
		const leastCommonBits = [];

		for (let bit = 0; bit < this.input[0].length; bit++) {
			let numZeros = 0, numOnes = 0;
			for (let line = 0; line < this.input.length; line++) {
				if (this.input[line][bit] === '0') {
					numZeros++;
				} else {
					numOnes++;
				}
			}

			if (numZeros > numOnes) {
				mostCommonBits.push('0');
				leastCommonBits.push('1');
			} else {
				mostCommonBits.push('1');
				leastCommonBits.push('0');
			}
		}

		this.sampleLog('Most common bits', mostCommonBits.join(''));
		this.sampleLog('Least common bits', leastCommonBits.join(''));

		const gammaRate = binaryStringToDecimal(mostCommonBits.join(''));
		const epsilonRate = binaryStringToDecimal(leastCommonBits.join(''));

		this.sampleLog('Gamma rate', gammaRate);
		this.sampleLog('Epsilon rate', epsilonRate);

		return `${gammaRate * epsilonRate}`;
	}

	protected solvePart2(): string {
		const oxygenRatingCandidates: Set<number> = new Set();
		const co2RatingCandidates: Set<number> = new Set();
		let oxygenRatingStr: Array<string> | undefined = undefined;
		let co2RatingStr: Array<string> | undefined = undefined;

		for (let i = 0; i < this.input.length; i++) {
			oxygenRatingCandidates.add(i);
			co2RatingCandidates.add(i);
		}

		for (let bit = 0; bit < this.input[0].length; bit++) {
			let numZerosOxygen = 0, numOnesOxygen = 0, numZerosCo2 = 0, numOnesCo2 = 0;

			for (let line = 0; line < this.input.length; line++) {
				if (oxygenRatingCandidates.has(line)) {
					if (this.input[line][bit] === '0') {
						numZerosOxygen++;
					} else {
						numOnesOxygen++;
					}
				}

				if (co2RatingCandidates.has(line)) {
					if (this.input[line][bit] === '0') {
						numZerosCo2++;
					} else {
						numOnesCo2++;
					}
				}
			}

			if (numZerosOxygen > numOnesOxygen) {
				this.keepWith('0', bit, oxygenRatingCandidates);
			} else {
				this.keepWith('1', bit, oxygenRatingCandidates);
			}

			if (numZerosCo2 <= numOnesCo2) {
				this.keepWith('0', bit, co2RatingCandidates);
			} else {
				this.keepWith('1', bit, co2RatingCandidates);
			}

			if (!oxygenRatingStr && oxygenRatingCandidates.size === 1) {
				oxygenRatingStr = this.input[oxygenRatingCandidates.values().next().value];
			}
			if (!co2RatingStr && co2RatingCandidates.size === 1) {
				co2RatingStr = this.input[co2RatingCandidates.values().next().value];
			}

			if (oxygenRatingStr && co2RatingStr) {
				break;
			}
		}

		this.sampleLog('Oxygen rating string', (oxygenRatingStr || []).join(''));
		this.sampleLog('CO2 rating string', (co2RatingStr || []).join(''));

		const oxygenRating = binaryStringToDecimal((oxygenRatingStr || []).join(''));
		const co2Rating = binaryStringToDecimal((co2RatingStr || []).join(''));

		this.sampleLog('Oxygen rating', oxygenRating);
		this.sampleLog('CO2 rating', co2Rating);

		return `${oxygenRating * co2Rating}`;
	}

	private keepWith(value: string, bitNumber: number, set: Set<number>) {
		for (const candidate of set) {
			const line = this.input[candidate];
			if (line[bitNumber] !== value) {
				set.delete(candidate);
			}
		}
	}
}

new Day3Solver().solveForArgs();