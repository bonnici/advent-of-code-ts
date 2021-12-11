import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

class Day10Solver extends Solver {
	private grid: GenericGrid<number> = new GenericGrid<number>(0, 0, () => 0);

	public init(inputFile: string): void {
		const chars = InputParser.readLinesAsChars(inputFile);
		this.grid = new GenericGrid<number>(
			chars[0].length,
			chars.length,
			() => 0,
			(a, b) => a - b,
			(n) => `${n}`,
		);
		for (let i = 0; i < chars.length; i++) {
			const line = chars[i];
			for (let j = 0; j < line.length; j++) {
				this.grid.set(j, i, parseInt(line[j]));
			}
		}
	}

	protected solvePart1(): string {
		this.sampleLog(`start\n${this.grid.toString()}\n`);

		let numFlashes = 0;
		for (let step = 0; step < 100; step++) {
			this.step();
			numFlashes += this.countFlashes();

			this.sampleLog(`after step ${step + 1}\n${this.grid.toString()}\n`);
		}

		return `${numFlashes}`;
	}

	protected solvePart2(): string {
		this.sampleLog(`start\n${this.grid.toString()}\n`);

		for (let step = 0; step < 100000; step++) {
			this.step();
			const curFlashes = this.countFlashes();
			if (curFlashes === this.grid.elements.length) {
				return `${step + 1}`;
			}
		}

		return 'Too many iterations';
	}

	private step(): void {
		this.grid.elements.forEach((n, i) => this.grid.elements[i] += 1);

		let flashed = true;
		while (flashed) {
			flashed = false;

			for (let x = 0; x < this.grid.width; x++) {
				for (let y = 0; y < this.grid.height; y++) {
					const coord = new Coord(x, y);

					if (this.grid.getC(coord) > 9) {
						this.grid.setC(coord, 0);
						flashed = true;

						this.increment(coord.left());
						this.increment(coord.right());
						this.increment(coord.up());
						this.increment(coord.down());
						this.increment(coord.upLeft());
						this.increment(coord.upRight());
						this.increment(coord.downLeft());
						this.increment(coord.downRight());
					}
				}
			}
		}
	}

	private increment(coord: Coord): void {
		const val = this.grid.safeGet(coord);
		if (val !== undefined && val > 0) {
			this.grid.setC(coord, val + 1);
		}
	}

	private countFlashes(): number {
		return this.grid.countOccurrences(0);
	}
}

new Day10Solver().solveForArgs();