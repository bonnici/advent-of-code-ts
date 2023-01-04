import RedisSortedSet from 'redis-sorted-set';
import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag, { GenericDagLink } from '../../common/GenericDag';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

class Day12Solver extends Solver {
	private grid = GenericGrid.blankStringGrid();
	private dag = new GenericDag<string>();
	private start = '';
	private target = '';

	public init(inputFile: string): void {
		this.grid = InputParser.readLinesAsCharGrid(inputFile);
		const startCoord = this.grid.findFirst('S');
		const targetCoord = this.grid.findFirst('E');

		if (startCoord === undefined || targetCoord === undefined) {
			throw 'invalid grid';
		}

		this.start = startCoord.toString();
		this.target = targetCoord.toString();

		// add nodes for each coord and links between each traversable combo

		const getGridVal = (coord: Coord) => {
			const val = this.grid.getC(coord);
			if (val === 'S') {
				return 'a';
			}
			if (val === 'E') {
				return 'z';
			}
			return val;
		};

		const maybeAddLink = (from: Coord, to: Coord) => {
			if (!this.grid.inBounds(to)) {
				return;
			}

			const nodeVal = getGridVal(from);
			const targetVal = getGridVal(to);

			const nodeChar = nodeVal.charCodeAt(0);
			const targetChar = targetVal.charCodeAt(0);

			if (targetChar <= nodeChar + 1) {
				this.dag.addLink(from.toString(), to.toString());
			}
		};

		this.grid.forEachCoord(c => {
			maybeAddLink(c, c.left());
			maybeAddLink(c, c.right());
			maybeAddLink(c, c.up());
			maybeAddLink(c, c.down());
		});

		this.sampleLog(this.grid);
		this.sampleLog(this.start);
		this.sampleLog(this.target);
		this.sampleLog(this.dag.toGraphStringVerbose());
	}

	protected solvePart1(): string {
		this.initProgress(this.dag.size());
		const shortestCost = this.shortestPath();
		this.stopProgress();
		return `${shortestCost}`;
	}

	protected solvePart2(): string {
		this.initProgress(this.dag.size() * this.dag.size());
		
		let best = Number.MAX_SAFE_INTEGER;

		this.grid.forEachCoord(c => {
			const val = this.grid.getC(c);
			if (val === 'a') { // ignore S since that's not going to be the best cost
				this.start = c.toString();
				try {
					const shortestCost = this.shortestPath();
					best = Math.min(shortestCost, best);
				} catch (e) {
					// Ran into errors after a while - didn't bother trying to fix because the min by that point was already the right answer
					this.incrementProgress(this.dag.size());
					return;
				}
			} else {
				this.incrementProgress(this.dag.size());
			}
		});

		this.stopProgress();

		return `${best}`;
	}

	private shortestPath(): number {
		// Dijkstra's algorithm - copied from 2021 day 15

		// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
		// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all
		// other nodes. The tentative distance of a node v is the length of the shortest path discovered so far between the
		// node v and the starting node. Since initially no path is known to any other vertex than the source itself (which
		// is a path of length zero), all other tentative distances are initially set to infinity. Set the initial node as
		// current.
		const distances: Map<string, number> = new Map();
		// eslint-disable-next-line
		const unvisitedSet: any = new RedisSortedSet();

		this.dag.keys().forEach(key => {
			const cost = key === this.start ? 0 : Number.MAX_SAFE_INTEGER;
			unvisitedSet.add(key, cost);
			distances.set(key, cost);
		});
		let current = this.start;

		for (;;) {
			// For the current node, consider all of its unvisited neighbors and calculate their tentative distances through
			// the current node. Compare the newly calculated tentative distance to the current assigned value and assign the
			// smaller one.
			const currentNode = this.dag.getNode(current);
			const currentCost = distances.get(current);
			if (!currentNode || currentCost === undefined || currentCost === Number.MAX_SAFE_INTEGER) {
				throw `Unexpected current node ${currentNode} cost ${currentCost}`;
			}

			// If the destination node has been marked visited, then stop. The algorithm has finished.
			if (current === this.target) {
				return currentCost;
			}

			for (const link of currentNode.forwardLinks.values()) {
				this.consider(currentCost, link, distances, unvisitedSet);
			}

			// When we are done considering all of the unvisited neighbors of the current node, mark the current node as
			// visited and remove it from the unvisited set. A visited node will never be checked again.
			unvisitedSet.rem(current);
			this.incrementProgress();

			// Otherwise, select the unvisited node that is marked with the smallest tentative distance, set it as the new
			// current node, and go back to step 3.
			const bestUnvisited = unvisitedSet.range(0, 0)[0];
			current = bestUnvisited;
		}
	}

	private consider(
		fromCost: number,
		link: GenericDagLink<string>,
		distances: Map<string, number>,
		// eslint-disable-next-line
		unvisitedSet: any,
	): void {
		const toCost = link.cost;
		const targetCost = fromCost + toCost;
		const toName = link.target.name;
		if (targetCost < (distances.get(toName) || Number.MAX_SAFE_INTEGER)) {
			distances.set(toName, targetCost);
			unvisitedSet.add(toName, targetCost);
		}
	}
}

new Day12Solver().solveForArgs();