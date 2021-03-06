import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord from '../../common/Coord';
import GenericGrid from '../../common/GenericGrid';

interface Instruction {
	dir: string,
	val: number
}

class Day13Solver extends Solver {
	private grid: GenericGrid<string> = new GenericGrid<string>(0, 0, () => '');
	private instructions: Array<Instruction> = [];
	private curWidth = 0;
	private curHeight = 0;

	public init(inputFile: string): void {
		const input = InputParser.readLinesInGroups(inputFile);
		this.sampleLog(input);

		const coords = [];
		let maxX = 0, maxY = 0;
		for (const line of input[0]) {
			const split = line.split(',');
			if (split.length !== 2) {
				throw 'unexpected coord line';
			}
			const x = parseInt(split[0]);
			const y = parseInt(split[1]);
			coords.push(new Coord(x, y));

			maxX = Math.max(x, maxX);
			maxY = Math.max(y, maxY);
		}

		this.grid = new GenericGrid<string>(maxX + 1, maxY + 1, () => '.');
		this.curWidth = maxX + 1;
		this.curHeight = maxY + 1;
		for (const coord of coords) {
			this.grid.setC(coord, '#');
		}

		this.sampleLog(this.grid.toString());

		for (const line of input[1]) {
			// fold along y=7
			const split1 = line.split(' ');
			if (split1.length !== 3) {
				throw 'unexpected instruction';
			}
			const split2 = split1[2].split('=');
			if (split2.length !== 2) {
				throw 'unexpected instruction';
			}

			this.instructions.push({ dir: split2[0], val: parseInt(split2[1]) });
		}

		this.sampleLog(this.instructions);
	}

	protected solvePart1(): string {
		this.fold(this.instructions[0]);

		this.sampleLog('after fold');
		this.sampleLog(this.grid.toString());

		this.sampleLog('adjusted width/height');
		this.sampleLog(this.printGrid());

		return `${this.grid.countOccurrences('#')}`;
	}

	protected solvePart2(): string {
		for (const instr of this.instructions) {
			this.fold(instr);
		}

		console.log(this.printGrid());

		return 'see above';
	}

	private fold(instruction: Instruction) {
		if (instruction.dir === 'x') {
			this.foldLeft(instruction.val);
		} else if (instruction.dir === 'y') {
			this.foldUp(instruction.val);
		}
	}

	private foldLeft(from: number) {
		for (let colDelta = 1; colDelta + from < this.grid.width; colDelta++) {
			for (let row = 0; row < this.grid.height; row++) {
				const coord = new Coord(from + colDelta, row);
				const char = this.grid.getC(coord);
				if (char === '#') {
					this.grid.setC(coord, '.');
					this.grid.setC(coord.left(colDelta * 2), '#');
				}
			}
		}
		this.curWidth = from;
	}

	private foldUp(from: number) {
		for (let rowDelta = 1; rowDelta + from < this.grid.height; rowDelta++) {
			for (let col = 0; col < this.grid.width; col++) {
				const coord = new Coord(col, from + rowDelta);
				const char = this.grid.getC(coord);
				if (char === '#') {
					this.grid.setC(coord, '.');
					this.grid.setC(coord.up(rowDelta * 2), '#');
				}
			}
		}
		this.curHeight = from;
	}

	private printGrid() {
		let result = '';
		for (let curY = 0; curY < this.curHeight; curY++) {
			for (let curX = 0; curX < this.curWidth; curX++) {
				result += this.grid.getC(new Coord(curX, curY));
			}
			result += '\n';
		}
		return result;
	}
}

new Day13Solver().solveForArgs();
