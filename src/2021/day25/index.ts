import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from "../../common/GenericGrid";
import Coord from "../../common/Coord";

class Day25Solver extends Solver {
	private gridInput: Array<string> = [];

	public init(inputFile: string): void {
		this.gridInput = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		let grid = GenericGrid.buildFromStringList(this.gridInput);
		this.sampleLog(grid.toString());

		const numSteps = this.runUntilStill(grid);

		return `${numSteps + 1}`;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
	}
	
	private runUntilStill(grid: GenericGrid<string>): number {
		let numSteps = 0;

		for (;;) {
			const toMoveEast = this.findMovable(grid, 'east');
			const newGrid = this.move(grid, 'east', toMoveEast);

			const toMoveSouth = this.findMovable(newGrid, 'south');

			if (toMoveEast.size === 0 && toMoveSouth.size === 0) {
				return numSteps;
			}

			grid = this.move(newGrid, 'south', toMoveSouth);

			this.sampleLog(`after step ${numSteps}`);
			this.sampleLog(grid.toString());

			numSteps++;
		}
	}

	private findMovable(grid: GenericGrid<string>, direction: 'east' | 'south'): Set<string> {
		const results: Set<string> = new Set();

		grid.forEachCoord((c) => {
			if (grid.getC(c) === (direction === 'east' ? '>' : 'v')) {
				const targetCoord = direction === 'east' ? c.right() : c.down();
				this.wrap(grid, targetCoord, direction);

				if (grid.getC(targetCoord) === '.') {
					results.add(c.toString());
				}
			}
		});

		return results;
	}

	// assumes there is space to move for everything in toMove array
	private move(grid: GenericGrid<string>, direction: 'east' | 'south', toMove: Set<string>): GenericGrid<string> {
		const newGrid = GenericGrid.copy(grid);

		toMove.forEach(c => {
			const coord = Coord.fromString(c);
			const target = direction === 'east' ? coord.right() : coord.down();
			this.wrap(grid, target, direction);

			newGrid.setC(coord, '.');
			newGrid.setC(target, direction === 'east' ? '>' : 'v');
		});

		return newGrid;
	}

	private wrap(grid: GenericGrid<string>, coord: Coord, direction: 'east' | 'south'): void {
		if (grid.inBounds(coord)) {
			return;
		}

		if (direction === 'east') {
			coord.x = 0;
		} else {
			coord.y = 0;
		}
	}
}

new Day25Solver().solveForArgs();
