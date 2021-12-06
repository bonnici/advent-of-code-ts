import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';

interface Line {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

class Day5Solver extends Solver {
	private input: Array<Line> = [];
	private maxX: number | null = null;
	private maxY: number | null = null;

	public init(inputFile: string): void {
		this.input = InputParser.readLinesWithTransform(inputFile, line => {
			const matched = line.match(/(\d+),(\d+) -> (\d+),(\d+)/);
			if (!matched) {
				throw 'invalid line';
			}

			const x1 = parseInt(matched[1]);
			const y1 = parseInt(matched[2]);
			const x2 = parseInt(matched[3]);
			const y2 = parseInt(matched[4]);

			if (this.maxX === null || Math.max(x1, x2) > this.maxX) {
				this.maxX = Math.max(x1, x2);
			}

			if (this.maxY === null || Math.max(y1, y2) > this.maxY) {
				this.maxY = Math.max(y1, y2);
			}

			return { x1, y1, x2, y2 };
		});


	}

	protected solvePart1(): string {
		const grid = new GenericGrid<number>((this.maxX || 0) + 1, (this.maxY || 0) + 1, () => 0);

		for (const line of this.input) {
			if (line.x1 === line.x2 && line.y1 === line.y2) {
				throw 'unexpected point';
			}

			if (line.x1 === line.x2) {
				const minY = Math.min(line.y1, line.y2);
				const maxY = Math.max(line.y1, line.y2);
				for (let curY = minY; curY <= maxY; curY++) {
					grid.set(line.x1, curY, grid.get(line.x1, curY) + 1);
				}
			} else if (line.y1 === line.y2) {
				const minX = Math.min(line.x1, line.x2);
				const maxX = Math.max(line.x1, line.x2);
				for (let curX = minX; curX <= maxX; curX++) {
					grid.set(curX, line.y1, grid.get(curX, line.y1) + 1);
				}
			}
		}

		let result = 0;
		for (const elem of grid.elements) {
			if (elem >= 2) {
				result += 1;
			}
		}

		return `${result}`;
	}

	protected solvePart2(): string {
		const grid = new GenericGrid<number>(
			(this.maxX || 0) + 1,
			(this.maxY || 0) + 1,
			() => 0,
			(a, b) => a - b,
			(n => `${n}`)
		);

		for (const line of this.input) {
			if (line.x1 === line.x2 && line.y1 === line.y2) {
				throw 'unexpected point';
			}

			if (line.x1 === line.x2) {
				const minY = Math.min(line.y1, line.y2);
				const maxY = Math.max(line.y1, line.y2);
				for (let curY = minY; curY <= maxY; curY++) {
					grid.set(line.x1, curY, grid.get(line.x1, curY) + 1);
				}
			} else if (line.y1 === line.y2) {
				const minX = Math.min(line.x1, line.x2);
				const maxX = Math.max(line.x1, line.x2);
				for (let curX = minX; curX <= maxX; curX++) {
					grid.set(curX, line.y1, grid.get(curX, line.y1) + 1);
				}
			} else {
				const xDiff = line.x2 - line.x1;
				const yDiff = line.y2 - line.y1;

				if (Math.abs(xDiff) !== Math.abs(yDiff)) {
					throw 'unexpected diagonal';
				}

				const xDelta = xDiff > 0 ? 1 : -1;
				const yDelta = yDiff > 0 ? 1 : -1;

				let curX = line.x1;
				let curY = line.y1;

				grid.set(curX, curY, grid.get(curX, curY) + 1);

				while (curX !== line.x2) {
					curX += xDelta;
					curY += yDelta;

					grid.set(curX, curY, grid.get(curX, curY) + 1);
				}
			}
		}

		let result = 0;
		for (const elem of grid.elements) {
			if (elem >= 2) {
				result += 1;
			}
		}

		this.sampleLog(grid.toString());

		return `${result}`;
	}
}

new Day5Solver().solveForArgs();