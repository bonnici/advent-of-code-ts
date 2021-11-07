import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Coord {
	idx: number;
	x: number;
	y: number;
}

class Day6Solver extends Solver {
	private input: Array<Coord> = [];
	private maxX = 0;
	private maxY = 0;
	private minX = 0;
	private minY = 0;

	public init(inputFile: string): void {
		let curIdx = 0;
		this.input = InputParser.readLinesWithTransform<Coord>(inputFile, line => {
			const split = line.split(',');
			return {
				idx: curIdx++,
				x: parseInt(split[0].trim()),
				y: parseInt(split[1].trim()),
			};
		});

		this.maxX = Math.max(...(this.input.map(c => c.x)));
		this.maxY = Math.max(...(this.input.map(c => c.y)));
		this.minX = Math.min(...(this.input.map(c => c.x)));
		this.minY = Math.min(...(this.input.map(c => c.y)));
	}

	protected solvePart1(): string {
		this.sampleLog(this.input, this.maxX, this.maxY, this.minX, this.minY);

		const areas = new Map();
		this.input.forEach(c => areas.set(c, 0));

		const infinites: Set<Coord> = new Set();

		this.initProgress(this.maxX - this.minX + 2);
		for (let x = this.minX - 1; x <= this.maxX + 1; x++) {
			for (let y = this.minY - 1; y <= this.maxY + 1; y++) {
				const closest = this.findClosest(x, y);

				if (closest) {
					this.sampleLog(`Closest to ${x},${y} is ${closest.coord.idx} (${closest.coord.x}, ${closest.coord.y})`);
				} else {
					this.sampleLog(`${x},${y} is closest to several`);
				}

				if (closest !== null) {
					areas.set(closest.coord, areas.get(closest.coord) + 1);

					// If we're on an edge, assume that the area covered by that coord is infinite
					if (!infinites.has(closest.coord) && (x === this.minX - 1 || x === this.maxX + 1 || y === this.minY - 1 || y === this.maxY + 1)) {
						infinites.add(closest.coord);
						this.sampleLog(`${closest.coord.idx} is infinite`);
					}
				}
			}
			this.incrementProgress();
		}

		this.stopProgress();

		// Filter out infinites
		[...infinites.keys()].forEach(c => {
			areas.delete(c);
		});

		const largestArea = Math.max(...(areas.values()));

		return `${largestArea}`;
	}

	protected solvePart2(isSample?: boolean): string {
		const lessThan = isSample ? 32: 10000;
		this.initProgress(this.maxX - this.minX + 1);

		// Assume region is within boundaries of min/max x/y
		let regionSize = 0;
		for (let x = this.minX; x <= this.maxX; x++) {
			for (let y = this.minY; y <= this.maxY; y++) {
				let totalDistance = 0;
				for (const c of this.input) {
					const curDist = Math.abs(c.x - x) + Math.abs(c.y - y);
					totalDistance += curDist;

					if (totalDistance >= lessThan) {
						break;
					}
				}

				if (totalDistance < lessThan) {
					regionSize++;
				}
			}

			this.incrementProgress();
		}

		this.stopProgress();

		return `${regionSize}`;
	}

	private findClosest(x: number, y: number): null | { coord: Coord, distance: number } {
		const distances: Map<Coord, number> = new Map();
		this.input.forEach(c => {
			const distance = Math.abs(c.x - x) + Math.abs(c.y - y);
			distances.set(c, distance);
		});

		const minDistance = Math.min(...(distances.values()));
		const minCoords = [...distances.keys()].filter(c => distances.get(c) === minDistance);

		return minCoords.length === 1 ? { coord: minCoords[0], distance: minDistance } : null;
	}
}

new Day6Solver().solveForArgs();
