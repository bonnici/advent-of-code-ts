import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

class Day3Solver extends Solver {
	private input: GenericGrid<string> = GenericGrid.blankStringGrid();

	public init(inputFile: string): void {
		this.input = InputParser.readLinesAsCharGrid(inputFile);
	}

	private isAdjacent(coord: Coord): boolean {
		// true if char at coord is adjacent to any symbol (non-number and non-dot)
		for (const c of coord.adjacentCoords(this.input.width, this.input.height)) {
			if (this.input.getC(c) !== '.' && isNaN(parseInt(this.input.getC(c)))) {
				return true;
			}
		}
		return false;
	}
	
	private findNumber(coord: Coord, seen: Set<string>, adjacent: Array<number>) {
		if (seen.has(coord.toString())) {
			return;
		}

		seen.add(coord.toString());

		const char = this.input.getC(coord);
		if (!isNaN(parseInt(char))) {
			// traverse left and mark as seen
			let curCoord = coord;
			while (curCoord.left().isValidPosition(this.input.width, this.input.height) && !isNaN(parseInt(this.input.getC(curCoord.left())))) {
				curCoord = curCoord.left();
				seen.add(curCoord.toString());
			}

			// traverse right and mark as seen, storing numbers
			const digits = [this.input.getC(curCoord)];
			while (curCoord.right().isValidPosition(this.input.width, this.input.height) && !isNaN(parseInt(this.input.getC(curCoord.right())))) {
				curCoord = curCoord.right();
				seen.add(curCoord.toString());
				digits.push(this.input.getC(curCoord));
			}

			adjacent.push(parseInt(digits.join('')));
		}
	}
	
	private adjacentNumbers(coord: Coord): Array<number> {
		const adjacent: Array<number> = [];
		const seen = new Set<string>();

		for (const c of coord.adjacentCoords(this.input.width, this.input.height)) {
			this.findNumber(c, seen, adjacent);
		}

		return adjacent;
	}

	protected solvePart1(): string {
		let result = 0;
		const seen = new Set<string>();
		this.input.forEachCoord(coord => {
			if (seen.has(coord.toString())) {
				return;
			}

			seen.add(coord.toString());

			const char = this.input.getC(coord);
			if (!isNaN(parseInt(char))) {
				// find whole number and mark all as seen
				const digits = [char];
				let adjacent = this.isAdjacent(coord);
				let nextCoord = coord.right();
				while (nextCoord.isValidPosition(this.input.width, this.input.height) && !isNaN(parseInt(this.input.getC(nextCoord)))) {
					digits.push(this.input.getC(nextCoord));
					seen.add(nextCoord.toString());
					adjacent = adjacent || this.isAdjacent(nextCoord);
					nextCoord = nextCoord.right();
				}
				if (adjacent) {
					result += parseInt(digits.join(''));
				}
			}
		});
		return `${result}`;
	}

	protected solvePart2(): string {
		let result = 0;
		this.input.forEachCoord(coord => {
			const char = this.input.getC(coord);
			if (char === '*') {
				const numbers = this.adjacentNumbers(coord);
				if (numbers.length == 2) {
					result += numbers[0] * numbers[1];
				}
			}
		});
		return `${result}`;
	}
}

new Day3Solver().solveForArgs();