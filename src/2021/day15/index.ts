import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';
import PriorityQueue  from 'priorityqueuejs';

interface QueueEntry {
	coord: string;
	distance: number;
}

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
		const targetStr = target.toString();

		this.initProgress(grid.elements.length);

		// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
		// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all
		// other nodes. The tentative distance of a node v is the length of the shortest path discovered so far between the
		// node v and the starting node. Since initially no path is known to any other vertex than the source itself (which
		// is a path of length zero), all other tentative distances are initially set to infinity. Set the initial node as
		// current.
		const distances: Map<string, number> = new Map();
		const visitedSet: Set<string> = new Set();
		const unvisitedSet: Set<string> = new Set();
		const unvisitedQueue = new PriorityQueue<QueueEntry>((a, b) => b.distance - a.distance);
		grid.forEachCoord(coord => {
			const str = coord.toString();
			unvisitedSet.add(str);
			distances.set(str, Number.MAX_SAFE_INTEGER);
			unvisitedQueue.enq({ coord: str, distance: str === start.toString() ? 0 : Number.MAX_SAFE_INTEGER });
		});
		distances.set(start.toString(), 0);
		let current = start;

		for(;;) {
			// For the current node, consider all of its unvisited neighbors and calculate their tentative distances through
			// the current node. Compare the newly calculated tentative distance to the current assigned value and assign the
			// smaller one.
			const currentStr = current.toString();
			const currentCost = distances.get(currentStr);
			if (currentCost === undefined || currentCost === Number.MAX_SAFE_INTEGER) {
				throw 'Unexpected current node';
			}

			this.consider(currentCost, current.left(), grid, distances);
			this.consider(currentCost, current.right(), grid, distances);
			this.consider(currentCost, current.up(), grid, distances);
			this.consider(currentCost, current.down(), grid, distances);

			// When we are done considering all of the unvisited neighbors of the current node, mark the current node as
			// visited and remove it from the unvisited set. A visited node will never be checked again.
			visitedSet.add(currentStr);
			unvisitedSet.delete(currentStr);
			this.incrementProgress();

			// If the destination node has been marked visited, then stop. The algorithm has finished.
			if (visitedSet.has(targetStr)) {
				this.stopProgress();
				return `${distances.get(targetStr)}`;
			}

			// Otherwise, select the unvisited node that is marked with the smallest tentative distance, set it as the new
			// current node, and go back to step 3.
			const costs = [...unvisitedSet.values()].map(coord => ({
				key: coord,
				distance: distances.get(coord) || Number.MAX_SAFE_INTEGER,
			}));
			const best = costs.reduce((acc, cur) => cur.distance < acc.distance ? cur : acc, { key: '', distance: Number.MAX_SAFE_INTEGER} );
			current = Coord.fromString(best.key);
		}
	}

	private consider(fromCost: number, toCoord: Coord, grid: GenericGrid<number>, distances: Map<string, number>): void {
		const toCost = grid.safeGet(toCoord);
		if (toCost !== undefined) {
			const targetCost = fromCost + toCost;
			if (targetCost < (distances.get(toCoord.toString()) || Number.MAX_SAFE_INTEGER)) {
				distances.set(toCoord.toString(), targetCost);
			}
		}
	}
}

new Day15Solver().solveForArgs();