import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

export class Pair {
	public depth: number;
	public parent: Pair | undefined;

	// single-value pairs just have a value
	public value: number | undefined;

	// recursive pairs have a left and right pair
	public left: Pair | undefined;
	public right: Pair | undefined;

	private constructor(parent?: Pair, value?: number) {
		this.parent = parent || undefined;
		this.depth = parent ? parent.depth + 1 : 0;
		this.value = value || undefined;
	}

	public static fromString(line: string, parent?: Pair): Pair {
		if (line.length === 0) {
			throw 'empty line';
		}

		const pair = new Pair();

		pair.parent = parent || undefined;
		pair.depth = parent ? (parent.depth) + 1 : 0;

		if (line[0] !== '[') {
			pair.value = parseInt(line);
			if (isNaN(pair.value)) {
				throw 'unexpected value';
			}
		} else {
			const inside = line.substr(1, line.length - 2);
			const separator = Pair.findSeparator(inside);

			pair.left = Pair.fromString(inside.substr(0, separator), pair);
			pair.right = Pair.fromString(inside.substr(separator + 1), pair);
		}

		return pair;
	}

	public static add(left: Pair, right: Pair): Pair {
		const pair = new Pair();
		pair.left = left;
		pair.left.parent = pair;
		pair.right = right;
		pair.right.parent = pair;

		left.incrementDepths();
		right.incrementDepths();

		return pair;
	}

	public static addAndReduce(left: Pair, right: Pair): Pair {
		const pair = Pair.add(left, right);

		let keepGoing = true;
		while (keepGoing) {
			keepGoing = pair.reduce();
		}

		return pair;
	}

	// this could be cached
	public leftmost(): Pair | undefined {
		if (this.left === undefined) {
			return undefined;
		}

		let leftmost = this.left;
		while (leftmost.left !== undefined) {
			leftmost = leftmost.left;
		}
		return leftmost;
	}

	// this could be cached
	public rightmost(): Pair | undefined {
		if (this.right === undefined) {
			return undefined;
		}

		let rightmost = this.right;
		while (rightmost.right !== undefined) {
			rightmost = rightmost.right;
		}
		return rightmost;
	}

	// this could be cached
	public next(): Pair | undefined {
		if (this.value === undefined || this.parent === undefined) {
			return undefined;
		}

		// find first parent with a different right node
		let nextParent: Pair | undefined = this.parent;
		while (nextParent.rightmost() === this) {
			if (nextParent.parent === undefined) {
				return undefined;
			}
			nextParent = nextParent.parent;
		}

		// leftmost of the right of that one must be next
		if (nextParent.right === undefined) {
			return undefined;
		} else if (nextParent.right.value !== undefined) {
			return nextParent.right;
		} else {
			return nextParent.right.leftmost();
		}
	}

	// this could be cached
	public prev(): Pair | undefined {
		if (this.value === undefined || this.parent === undefined) {
			return undefined;
		}

		// find first parent with a different left node
		let nextParent: Pair | undefined = this.parent;
		while (nextParent.leftmost() === this) {
			if (nextParent.parent === undefined) {
				return undefined;
			}
			nextParent = nextParent.parent;
		}

		// rightmost of the left of that one must be next
		if (nextParent.left === undefined) {
			return undefined;
		} else if (nextParent.left.value !== undefined) {
			return nextParent.left;
		} else {
			return nextParent.left.rightmost();
		}
	}

	// returns true if anything was changed
	public reduce(): boolean {
		// first try exploding all
		let current = this.leftmost();
		while (current !== undefined) {
			// this should be a DFS instead of trying to process the same parent twice
			if (current.parent && current.parent.explode()) {
				return true;
			}

			current = current.next();
		}

		// then try splitting all
		current = this.leftmost();
		while (current !== undefined) {
			if (current.split()) {
				return true;
			}

			current = current.next();
		}

		return false;
	}

	// returns true if pair was exploded
	public explode(): boolean {
		if (this.depth < 4) {
			return false;
		}

		const leftVal = this.left?.value;
		const rightVal = this.right?.value;

		if (leftVal === undefined || rightVal === undefined) {
			return false;
		}

		const toAddLeft = this.left?.prev();
		if (toAddLeft?.value !== undefined) {
			toAddLeft.value += leftVal;
		}

		const toAddRight = this.right?.next();
		if (toAddRight?.value !== undefined) {
			toAddRight.value += rightVal;
		}

		this.value = 0;
		this.left = undefined;
		this.right = undefined;

		return true;
	}

	// returns true if pair was split
	public split(): boolean {
		if (this.value === undefined || this.value < 10) {
			return false;
		}

		const halfRoundedDown = Math.floor(this.value / 2);
		const halfRoundedUp = Math.ceil(this.value / 2);

		this.value = undefined;
		this.left = new Pair(this, halfRoundedDown);
		this.right = new Pair(this, halfRoundedUp);

		return true;
	}

	public magnitude(): number {
		if (this.value !== undefined) {
			return this.value;
		}

		if (this.left === undefined || this.right === undefined) {
			throw 'invalid pair';
		}

		return (this.left.magnitude() * 3) + (this.right.magnitude() * 2);
	}

	public toString(): string {
		if (this.value !== undefined) {
			return `${this.value}`;
		}

		return `[${this.left?.toString()},${this.right?.toString()}]`;
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

	private incrementDepths(): void {
		this.depth++;

		if (this.left) {
			this.left.incrementDepths();
		}
		if (this.right) {
			this.right.incrementDepths();
		}
	}
}

class Day18Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		let sum = Pair.fromString(this.input[0]);

		this.initProgress(this.input.length - 1);

		for (let i = 1; i < this.input.length; i++) {
			const toAdd = Pair.fromString(this.input[i]);
			this.sampleLog(`Adding ${toAdd.toString()} to ${sum.toString()}`);

			sum = Pair.addAndReduce(sum, toAdd);

			this.sampleLog(`After sum: ${sum.magnitude()}, ${sum.toString()}`);
			this.incrementProgress();
		}

		this.stopProgress();

		return `${sum.magnitude()}`;
	}

	protected solvePart2(): string {
		let largest = 0;

		this.initProgress(this.input.length * this.input.length);

		for (let i = 0; i < this.input.length; i++) {
			for (let j = 0; j < this.input.length; j++) {
				if (i !== j) {
					const left = Pair.fromString(this.input[i]);
					const right = Pair.fromString(this.input[j]);
					const sum = Pair.addAndReduce(left, right);
					const magnitude = sum.magnitude();

					largest = Math.max(magnitude, largest);

					if (largest === magnitude) {
						this.sampleLog(`Found new largest magnitude of ${magnitude} at indices ${i} and ${j}`);
						this.sampleLog(`${left.toString()} + ${right.toString()} = ${sum.toString()}`);
					}
				}

				this.incrementProgress();
			}
		}

		this.stopProgress();
		return `${largest}`;
	}
}

new Day18Solver().solveForArgs();