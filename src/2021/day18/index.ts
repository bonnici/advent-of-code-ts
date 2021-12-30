import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

export class Pair {
	public left: Pair | undefined;
	public right: Pair | undefined;
	public value: number | undefined;

	constructor(line: string) {
		if (line.length === 0) {
			throw 'empty line';
		}

		if (line[0] !== '[') {
			this.value = parseInt(line);
			if (isNaN(this.value)) {
				throw 'unexpected value';
			}
		} else {
			const inside = line.substr(1, line.length - 2);
			const separator = Pair.findSeparator(inside);

			this.left = new Pair(inside.substr(0, separator));
			this.right = new Pair(inside.substr(separator + 1));
		}
	}

	private static findSeparator(str: string): number {
		let depth = 0;
		for (let i = 0; i < str.length; i++) {
			const ch = str.charAt(i);
			if (ch === '[') {
				depth++;
			} else if (ch === ']') {
				depth--;
			} else if (ch === ',' && depth === 0) {
				return i;
			}
		}

		throw 'invalid line';
	}

	// todo - parent, next, prev, leftmost, rightmost, depth
	// todo - split, explode, magnitude, private recalculateDepth
}

class Day18Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		return `${'todo'}`;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
	}
}

new Day18Solver().solveForArgs();