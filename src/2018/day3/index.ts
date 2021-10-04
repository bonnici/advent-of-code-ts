import {Solver} from '../../common/Solver';
import {InputParser} from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';

interface Claim {
	claimId: number;
	fromLeft: number;
	fromTop: number;
	width: number;
	height: number;
}

// #123 @ 3,2: 5x4
const inputRe = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;

class Day3Solver extends Solver {
	private claims: Array<Claim> = [];
	private gridWidth = 0;
	private gridHeight = 0;

	public init(inputFile: string): void {
		this.claims = InputParser.readLines(inputFile).map(Day3Solver.mapInput);

		this.gridWidth = this.claims.reduce((acc, cur) => Math.max(acc, cur.fromLeft + cur.width), 0);
		this.gridHeight = this.claims.reduce((acc, cur) => Math.max(acc, cur.fromTop + cur.height), 0);
	}

	protected solvePart1(): string {
		const compareFn = (a: string, b: string) => a.localeCompare(b);
		const grid = new GenericGrid<string>(this.gridWidth, this.gridHeight, () => '.', compareFn, a => a);

		this.claims.forEach(c => {
			for (let x = c.fromLeft; x < c.fromLeft + c.width; x++) {
				for (let y = c.fromTop; y < c.fromTop + c.height; y++) {
					const char = grid.get(x, y);
					switch (char) {
					case '.':
						grid.set(x, y, '1');
						break;
					case '1':
						grid.set(x, y, '2');
						break;
						// No change for 2 or more
					default:
						break;
					}
				}
			}
		});

		return `${grid.countOccurrences('2')}`;
	}

	protected solvePart2(): string {
		const renderFn = (val: Set<number>) => {
			if (val.size === 0) {
				return '.';
			}
			if (val.size === 1) {
				return `${val.values().next().value}`;
			}
			return 'X';
		};
		const grid = new GenericGrid<Set<number>>(this.gridWidth, this.gridHeight, () => new Set(), undefined, renderFn);

		const allClaims = new Set();

		this.claims.forEach(c => {
			allClaims.add(c.claimId);
			for (let x = c.fromLeft; x < c.fromLeft + c.width; x++) {
				for (let y = c.fromTop; y < c.fromTop + c.height; y++) {
					grid.get(x, y).add(c.claimId);
				}
			}
		});

		grid.elements.forEach(set => {
			if (set.size > 1) {
				set.forEach(val => allClaims.delete(val));
			}
		});

		if (allClaims.size !== 1) {
			throw 'More than 1 claim left';
		}

		return `${allClaims.values().next().value}`;
	}

	private static mapInput(line: string): Claim {
		const match = line.match(inputRe) || [];
		return {
			claimId: parseInt(match[1]),
			fromLeft: parseInt(match[2]),
			fromTop: parseInt(match[3]),
			width: parseInt(match[4]),
			height: parseInt(match[5]),
		};
	}
}

new Day3Solver().solveForArgs();
