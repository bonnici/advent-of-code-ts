import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

interface Basin {
	start: Coord,
	coords: Set<string>, // String set for efficient lookup
}

class Day9Solver extends Solver {
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
		let sum = 0;

		for (let y = 0; y < this.grid.height; y++) {
			for (let x = 0; x < this.grid.width; x++) {
				const coord = new Coord(x, y);
				const cur = this.grid.getC(coord);

				const left = this.grid.safeGet(coord.left());
				const right = this.grid.safeGet(coord.right());
				const top = this.grid.safeGet(coord.up());
				const bottom = this.grid.safeGet(coord.down());

				if (this.isLess(cur, left) && this.isLess(cur, right) && this.isLess(cur, top) && this.isLess(cur, bottom)) {
					this.sampleLog(`Found low point of ${cur} at ${coord.toString()}`);
					sum += (cur + 1);
				}
			}
		}

		return `${sum}`;
	}

	private isLess(cur: number, target: number | undefined): boolean {
		return target === undefined || cur < target;
	}

	protected solvePart2(): string {
		const basins: Array<Basin> = [];

		for (let y = 0; y < this.grid.height; y++) {
			for (let x = 0; x < this.grid.width; x++) {
				const coord = new Coord(x, y);
				const cur = this.grid.getC(coord);

				const left = this.grid.safeGet(coord.left());
				const right = this.grid.safeGet(coord.right());
				const top = this.grid.safeGet(coord.up());
				const bottom = this.grid.safeGet(coord.down());

				if (this.isLess(cur, left) && this.isLess(cur, right) && this.isLess(cur, top) && this.isLess(cur, bottom)) {
					this.sampleLog(`Found low point of ${cur} at ${coord.toString()}`);
					const basin = { start: coord, coords: new Set([coord.toString()]) };
					this.expandBasinFrom(basin, coord);
					this.sampleLog(`Expanded basin to ${basin.coords.size} points`);
					basins.push(basin);
				}
			}
		}

		const sizes = [...basins.values()].map(b => b.coords.size).sort((a, b) => b - a);
		this.sampleLog(sizes);

		return `${sizes[0] * sizes[1] * sizes[2]}`;
	}

	private expandBasinFrom(basin: Basin, coord: Coord): void {
		const left = coord.left();
		if (this.shouldExpandBasin(basin, coord, left)) {
			basin.coords.add(left.toString());
			this.expandBasinFrom(basin, left);
		}

		const right = coord.right();
		if (this.shouldExpandBasin(basin, coord, right)) {
			basin.coords.add(right.toString());
			this.expandBasinFrom(basin, right);
		}

		const top = coord.up();
		if (this.shouldExpandBasin(basin, coord, top)) {
			basin.coords.add(top.toString());
			this.expandBasinFrom(basin, top);
		}

		const bottom = coord.down();
		if (this.shouldExpandBasin(basin, coord, bottom)) {
			basin.coords.add(bottom.toString());
			this.expandBasinFrom(basin, bottom);
		}
	}

	private shouldExpandBasin(basin: Basin, from: Coord, to: Coord): boolean {
		if (basin.coords.has(to.toString())) {
			return false;
		}

		const target = this.grid.safeGet(to);
		if (target === undefined || target === 9) {
			return false;
		}

		const cur = this.grid.safeGet(from);
		return cur !== undefined && target > cur;
	}
}

new Day9Solver().solveForArgs();