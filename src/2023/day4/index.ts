import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Card {
	id: number;
	winningNumbers: Set<number>;
	numbersYouHave: Set<number>;
	numMatches: number;
	numCopies: number;
}

class Day4Solver extends Solver {
	private input: Array<Card> = [];

	public init(inputFile: string): void {
		let lineNum = 1;
		this.input = InputParser.readLinesWithTransform<Card>(inputFile, line => {
			const split = line.substring(line.indexOf(':') + 2).split('|');
			const winningNumbers = new Set<number>(split[0].split(' ').map(n => parseInt(n.trim())).filter(n => !isNaN(n)));
			const numbersYouHave = new Set<number>(split[1].split(' ').map(n => parseInt(n.trim())).filter(n => !isNaN(n)));
			const intersection = new Set([...(numbersYouHave)].filter(x => winningNumbers.has(x)));
			return {
				id: lineNum++,
				winningNumbers,
				numbersYouHave,
				numMatches: intersection.size,
				numCopies: 1,
			};
		});
	}

	protected solvePart1(): string {
		let result = 0;
		for (const card of this.input) {
			if (card.numMatches > 0) {
				result += 2 ** (card.numMatches - 1);
			}
		}
		return `${result}`;
	}

	protected solvePart2(): string {
		for (const card of this.input) {
			for (let i = 0; i < card.numMatches; i++) {
				this.input[card.id + i].numCopies += card.numCopies;
			}
		}
		return `${this.input.reduce((acc, cur) => acc + cur.numCopies, 0)}`;
	}
}

new Day4Solver().solveForArgs();