import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

interface Path {
	coords: Array<Coord>;
}

class Reservoir {
	public grid: GenericGrid<string> = GenericGrid.blankStringGrid();
	private xOffset = 0;

	constructor(private logFn: (str: string | number) => void) {}

	public init(paths: Array<Path>) {
		let minX = Number.MAX_SAFE_INTEGER;
		let maxX = 0;
		let minY = Number.MAX_SAFE_INTEGER;
		let maxY = 0;

		paths.forEach(p => {
			this.logFn(p.coords.map(c => c.toString()).join(' -> '));
			p.coords.forEach(c => {
				minX = Math.min(c.x, minX);
				maxX = Math.max(c.x, maxX);
				minY = Math.min(c.y, minY);
				maxY = Math.max(c.y, maxY);
			});
		});

		// extra slack for part 2
		maxY +=2;

		this.logFn(`minX: ${minX} maxX: ${maxX} minY: ${minY} maxY: ${maxY}`);


		// Use full Y because we drop sand from Y=0.
		// X value is constrained beteween around 475 and 550 so we don't need all X's, but we do
		// need enough space for sand to fall (x bounds + height slack on either side)
		const width = maxX - minX + (maxY * 2);
		this.xOffset = minX - maxY; // "true x" = x + xOffset
		this.grid = new GenericGrid<string>(
			width,
			maxY + 1,
			() => '.',
			(a, b) => a.localeCompare(b),
			s => s,
		);

		paths.forEach(p => {
			if (p.coords.length < 2) {
				throw 'unexpected coords';
			}
			for (let i = 1; i < p.coords.length; i++) {
				const from = p.coords[i-1];
				const to = p.coords[i];

				this.logFn(`drawing line from: ${from} to ${to}`);
		
				if (from.x === to.x) {
					// vertical line
					const minY = Math.min(from.y, to.y);
					const maxY = Math.max(from.y, to.y);
					for (let y = minY; y <= maxY; y++) {
						this.logFn(`setting: ${from.x - this.xOffset},${y}`);
						this.grid.set(from.x - this.xOffset, y, '#');
					}
				} else if (from.y === to.y) {
					// horizontal line
					const minX = Math.min(from.x, to.x);
					const maxX = Math.max(from.x, to.x);
					for (let x = minX; x <= maxX; x++) {
						this.logFn(`setting: ${x - this.xOffset},${from.y}`);
						this.grid.set(x - this.xOffset, from.y, '#');
					}
				} else {
					throw 'unexpected path';
				}
			}
		});

		this.print();
	}

	public print(): void {
		const trueXIndices = [...Array(this.grid.width).keys()].map(x => x + this.xOffset);
		this.logFn(trueXIndices.map(x => `${Math.floor(x / 100)}`).join(''));
		this.logFn(trueXIndices.map(x => `${Math.floor((x % 100) / 10)}`).join(''));
		this.logFn(trueXIndices.map(x => `${x % 10}`).join(''));
		this.logFn(this.grid.toString());
	}

	public sandCount(): number {
		return this.grid.countOccurrences('o');
	}

	public dropSand(x: number) {
		let sandCoord: Coord | null = new Coord(x - this.xOffset, 0);
		if (this.grid.getC(sandCoord) !== '.') {
			this.logFn('Sand at drop point, aborting');
			return;
		}

		for (;;) {
			this.logFn(`Simulating step for coord ${sandCoord.toString()}`);
			const oldCoord = Coord.clone(sandCoord);
			sandCoord = this.step(sandCoord);

			if (sandCoord === null) {
				this.logFn(` Sand fell into the void from coord ${oldCoord.toString()}`);
				return;
			} else if (sandCoord.toString() === oldCoord.toString()) {
				this.logFn(` Sand came to rest at ${sandCoord.toString()}`);
				this.grid.setC(sandCoord, 'o');
				return;
			}
		}
	}

	public drawBottomLine(): void {
		for (let x = 0; x < this.grid.width; x++) {
			this.grid.set(x, this.grid.height - 1, '#');
		}
	}

	private step(coord: Coord): Coord | null {
		// could speed this up by looking for the first non-empty spot in the col instead of stepping each time
		const down = coord.down();
		if (!this.grid.inBounds(down)) {
			this.logFn(`  Down coord ${down.toString()} was out of bounds`);
			return null;
		}
		if (this.grid.getC(down) === '.') {
			this.logFn(`  Sand moved down to coord ${down.toString()}`);
			return down;
		}

		const downLeft = coord.downLeft();
		if (!this.grid.inBounds(downLeft)) {
			this.logFn(`  Down-left coord ${downLeft.toString()} was out of bounds`);
			return null;
		}
		if (this.grid.getC(downLeft) === '.') {
			this.logFn(`  Sand moved down-left to coord ${downLeft.toString()}`);
			return downLeft;
		}

		const downRight = coord.downRight();
		if (!this.grid.inBounds(downRight)) {
			this.logFn(`  Down-right coord ${downRight.toString()} was out of bounds`);
			return null;
		}
		if (this.grid.getC(downRight) === '.') {
			this.logFn(`  Sand moved down-right to coord ${downRight.toString()}`);
			return downRight;
		}

		this.logFn(`  Sand came to rest at ${coord.toString()}`);
		return coord;
	}
}

class Day14Solver extends Solver {
	private reservoir = new Reservoir(this.sampleLog);

	public init(inputFile: string): void {
		const paths: Array<Path> = InputParser.readLinesWithTransform(inputFile, line => {
			const split = line.split(' -> ');
			return { coords: split.map(c => Coord.fromString(c)) };
		});

		this.reservoir.init(paths);
	}

	protected solvePart1(): string {
		let expectedSand = 0;
		this.initProgress(this.reservoir.grid.elements.length);
		do {
			this.reservoir.dropSand(500);
			expectedSand++;
			this.sampleLog(`\nAfter dropping sand number ${expectedSand}`);
			this.reservoir.print();
			this.incrementProgress();
		} while (expectedSand === this.reservoir.sandCount());
		this.stopProgress();

		return `${this.reservoir.sandCount()}`;
	}

	protected solvePart2(): string {
		this.reservoir.drawBottomLine();
		this.sampleLog('After drawing bottom line');
		this.reservoir.print();

		let expectedSand = 0;
		this.initProgress(this.reservoir.grid.elements.length);
		do {
			this.reservoir.dropSand(500);
			expectedSand++;
			this.sampleLog(`\nAfter dropping sand number ${expectedSand}`);
			this.reservoir.print();
			this.incrementProgress();
		} while (expectedSand === this.reservoir.sandCount());
		this.stopProgress();

		return `${this.reservoir.sandCount()}`;
	}
}

new Day14Solver().solveForArgs();