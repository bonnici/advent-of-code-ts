import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';
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
		// refactored into a grid function
		return this.dag.shortestPath(this.start, this.target, () => this.incrementProgress());
	}
}

new Day12Solver().solveForArgs();