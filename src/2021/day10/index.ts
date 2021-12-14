import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day10Solver extends Solver {
	private input: Array<string> = [];
	private syntaxScores: { [char: string]: number} = {
		')': 3,
		']': 57,
		'}': 1197,
		'>': 25137,
	};
	private completionScores: { [char: string]: number} = {
		'(': 1,
		'[': 2,
		'{': 3,
		'<': 4,
	};

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		let score = 0;
		for (const line of this.input) {
			score += this.syntaxErrorScore(line);
		}

		return `${score}`;
	}

	protected solvePart2(): string {
		const scores = [];
		for (const line of this.input) {
			const score = this.completionScore(line);
			if (score > 0) {
				scores.push(score);
			}
		}

		scores.sort((a, b) => a - b);

		return `${scores[Math.floor(scores.length / 2)]}`;
	}

	private syntaxErrorScore(line: string): number {
		const stack: Array<string> = [];

		for (const char of line) {
			if ('[({<'.includes(char)) {
				stack.push(char);
			} else {
				const opening = stack.pop();
				if (!opening) {
					throw 'unexpected char';
				}

				if (
					(char === ']' && opening !== '[') ||
					(char === ')' && opening !== '(') ||
					(char === '}' && opening !== '{') ||
					(char === '>' && opening !== '<')
				) {
					return this.syntaxScores[char];
				}
			}
		}
		return 0;
	}

	private completionScore(line: string): number {
		// Don't count corrupt lines
		if (this.syntaxErrorScore(line) > 0) {
			return 0;
		}

		const stack: Array<string> = [];

		for (const char of line) {
			if ('[({<'.includes(char)) {
				stack.push(char);
			} else {
				stack.pop();
			}
		}

		let score = 0;
		while (stack.length > 0) {
			score *= 5;

			const opening = stack.pop();
			score += opening ? this.completionScores[opening] : 0;
		}

		this.sampleLog(`Score for line ${line} is ${score}`);

		return score;
	}
}

new Day10Solver().solveForArgs();