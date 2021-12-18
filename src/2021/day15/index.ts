import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisSortedSet = require('redis-sorted-set');

class Day15Solver extends Solver {
	private inputFile = '';

	public init(inputFile: string): void {
		this.inputFile = inputFile;
	}

	protected solvePart1(): string {
		const grid = InputParser.readLinesAsNumberGrid(this.inputFile);
		this.sampleLog(grid.toString());

		const start = new Coord(0, 0);
		const target = new Coord(grid.width - 1, grid.height - 1);
		return this.shortestPath(grid, start, target);
	}

	protected solvePart2(): string {
		const grid = InputParser.readLinesAsNumberGrid(this.inputFile);
		const biggerGrid = new GenericGrid<number>(
			grid.width * 5,
			grid.height * 5,
			() => 0,
			(a, b) => a - b,
			(n) => `${n}`,
		);

		for (let row = 0; row < 5; row++) {
			for (let col = 0; col < 5; col++) {
				grid.forEachCoord(coord => {
					const original = grid.getC(coord);
					let adjusted = original + row + col;
					while (adjusted > 9) {
						adjusted -= 9;
					}
					const targetCoord = coord.down(grid.height * row).right(grid.width * col);
					biggerGrid.setC(targetCoord, adjusted);
				});
			}
		}
		this.sampleLog(biggerGrid.toString());

		const start = new Coord(0, 0);
		const target = new Coord(biggerGrid.width - 1, biggerGrid.height - 1);
		return this.shortestPath(biggerGrid, start, target);
	}


	private shortestPath(grid: GenericGrid<number>, start: Coord, target: Coord): string {
		// Dijkstra's algorithm
		// todo - refactor (may not need distances map and can probably get current from unvisited set)
		// todo - move to generic grid class? or other helper function
		const targetStr = target.toString();

		this.initProgress(grid.elements.length);

		// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
		// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all
		// other nodes. The tentative distance of a node v is the length of the shortest path discovered so far between the
		// node v and the starting node. Since initially no path is known to any other vertex than the source itself (which
		// is a path of length zero), all other tentative distances are initially set to infinity. Set the initial node as
		// current.
		const distances: Map<string, number> = new Map();
		const unvisitedSet: any = new RedisSortedSet();

		grid.forEachCoord(coord => {
			const str = coord.toString();
			unvisitedSet.add(str, str === start.toString() ? 0 : Number.MAX_SAFE_INTEGER);
			distances.set(str, Number.MAX_SAFE_INTEGER);
		});
		distances.set(start.toString(), 0);
		let current = start;

		for (;;) {
			// For the current node, consider all of its unvisited neighbors and calculate their tentative distances through
			// the current node. Compare the newly calculated tentative distance to the current assigned value and assign the
			// smaller one.
			const currentStr = current.toString();
			const currentCost = distances.get(currentStr);
			if (currentCost === undefined || currentCost === Number.MAX_SAFE_INTEGER) {
				throw 'Unexpected current node';
			}

			// If the destination node has been marked visited, then stop. The algorithm has finished.
			if (currentStr === targetStr) {
				this.stopProgress();
				return `${currentCost}`;
			}

			this.consider(currentCost, current.left(), grid, distances, unvisitedSet);
			this.consider(currentCost, current.right(), grid, distances, unvisitedSet);
			this.consider(currentCost, current.up(), grid, distances, unvisitedSet);
			this.consider(currentCost, current.down(), grid, distances, unvisitedSet);

			// When we are done considering all of the unvisited neighbors of the current node, mark the current node as
			// visited and remove it from the unvisited set. A visited node will never be checked again.
			unvisitedSet.rem(currentStr);
			this.incrementProgress();

			// Otherwise, select the unvisited node that is marked with the smallest tentative distance, set it as the new
			// current node, and go back to step 3.
			const bestUnvisited = unvisitedSet.range(0, 0)[0];
			current = Coord.fromString(bestUnvisited);
		}
	}

	private consider(
		fromCost: number,
		toCoord: Coord,
		grid: GenericGrid<number>,
		distances: Map<string, number>,
		unvisitedSet: any,
	): void {
		const toCost = grid.safeGet(toCoord);
		if (toCost !== undefined) {
			const targetCost = fromCost + toCost;
			const toStr = toCoord.toString();
			if (targetCost < (distances.get(toStr) || Number.MAX_SAFE_INTEGER)) {
				distances.set(toStr, targetCost);
				unvisitedSet.add(toStr, targetCost);
			}
		}
	}
}

new Day15Solver().solveForArgs();