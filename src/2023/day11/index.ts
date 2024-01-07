import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

class Day11Solver extends Solver {
	private grid: GenericGrid<string> = GenericGrid.blankStringGrid();

	public init(inputFile: string): void {
		this.grid = InputParser.readLinesAsCharGrid(inputFile);
	}

	protected solvePart1(): string {
		this.sampleLog(this.grid.toString());
		
		const galaxies = this.findGalaxyCoords(1);

		this.sampleLog(galaxies.map(c => c.toString()).join(' | '));

		// Calculate sum of distance between each pair
		let result = 0;
		for (let i = 0; i < galaxies.length; i++) {
			for (let j = i + 1; j < galaxies.length; j++) {
				if (i != j) {
					result += galaxies[i].distance(galaxies[j]);
				}
			}
		}

		return `${result}`;
	}

	private findGalaxyCoords(expansionSize: number): Array<Coord> {
		// Find rows that need doubling
		const rowsToPad: Array<number> = [];
		for (let row = 0; row < this.grid.height; row++) {
			let found = false;
			for (let col = 0; col < this.grid.width; col++) {
				if (this.grid.get(col, row) === '#') {
					found = true;
					break;
				}
			}
			if (!found) {
				rowsToPad.push(row);
			}
		}

		// Find cols that need doubling
		const colsToPad: Array<number> = [];
		for (let col = 0; col < this.grid.width; col++) {
			let found = false;
			for (let row = 0; row < this.grid.height; row++) {
				if (this.grid.get(col, row) === '#') {
					found = true;
					break;
				}
			}
			if (!found) {
				colsToPad.push(col);
			}
		}

		// Find adjusted coordinates of all galaxies
		const galaxies: Array<Coord> = [];
		this.grid.forEachCoord(coord => {
			if (this.grid.getC(coord) === '#') {
				galaxies.push(this.adjustCoord(coord, colsToPad, rowsToPad, expansionSize));
			}
		});

		return galaxies;
	}

	private adjustCoord(coord: Coord, colsToPad: number[], rowsToPad: number[], expansionSize: number): Coord {
		const extraCols = colsToPad.filter(c => c < coord.x).length;
		const extraRows = rowsToPad.filter(c => c < coord.y).length;
		return new Coord(coord.x + (extraCols * expansionSize), coord.y + (extraRows * expansionSize));
	}

	protected solvePart2(): string {
		this.sampleLog(this.grid.toString());
		
		const expansionSize = (process.env.SAMPLE_FILE ? 100 : 1000000) - 1;
		const galaxies = this.findGalaxyCoords(expansionSize);

		this.sampleLog(galaxies.map(c => c.toString()).join(' | '));

		// Calculate sum of distance between each pair
		let result = 0;
		for (let i = 0; i < galaxies.length; i++) {
			for (let j = i + 1; j < galaxies.length; j++) {
				if (i != j) {
					result += galaxies[i].distance(galaxies[j]);
				}
			}
		}

		return `${result}`;
	}
}

new Day11Solver().solveForArgs();