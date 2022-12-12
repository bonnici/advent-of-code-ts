import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord from '../../common/Coord';

class Day9Solver extends Solver {
	private input: Array<string> = [];
	private coords = [new Coord(0, 0),  new Coord(0, 0)];
	private tailVisited = new Set<string>();

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
		this.sampleLog(this.input.toString());

		this.tailVisited.add(this.coords[0].toString());
	}
	
	private moveHead(direction: string) {
		switch (direction) {
		case 'U':
			this.coords[0] = this.coords[0].up();
			break;
		case 'D':
			this.coords[0] = this.coords[0].down();
			break;
		case 'L':
			this.coords[0] = this.coords[0].left();
			break;
		case 'R':
			this.coords[0] = this.coords[0].right();
			break;
		default:
			throw `unexpected direction ${direction}`;
		}
	}

	private moveKnot(index: number) {
		/*
		Move based on all possible pre-move positions (x, y).
		0 is no move needed, X is moving towards new position, blank is impossible position.
		  -2 -1 0 1 2
		-2  X X X X X
		-1  X 0 0 0 X
		 0  X 0 0 0 X
     1  X 0 0 0 X
		 2  X X X X X
		*/

		const diff = this.coords[index - 1].diff(this.coords[index]);
		switch (diff.toString()) {
		case '-1,-2':
			this.coords[index] = this.coords[index].downRight();
			break;
		case '0,-2':
			this.coords[index] = this.coords[index].down();
			break;
		case '1,-2':
			this.coords[index] = this.coords[index].downLeft();
			break;
		case '-2,-1':
			this.coords[index] = this.coords[index].downRight();
			break;
		case '-2,0':
			this.coords[index] = this.coords[index].right();
			break;
		case '-2,1':
			this.coords[index] = this.coords[index].upRight();
			break;
		case '2,-1':
			this.coords[index] = this.coords[index].downLeft();
			break;
		case '2,0':
			this.coords[index] = this.coords[index].left();
			break;
		case '2,1':
			this.coords[index] = this.coords[index].upLeft();
			break;
		case '-1,2':
			this.coords[index] = this.coords[index].upRight();
			break;
		case '0,2':
			this.coords[index] = this.coords[index].up();
			break;
		case '1,2':
			this.coords[index] = this.coords[index].upLeft();
			break;
		case '-2,-2':
			this.coords[index] = this.coords[index].downRight();
			break;
		case '2,-2':
			this.coords[index] = this.coords[index].downLeft();
			break;
		case '-2,2':
			this.coords[index] = this.coords[index].upRight();
			break;
		case '2,2':
			this.coords[index] = this.coords[index].upLeft();
			break;
		case '-1,-1':
		case '-1,0':
		case '-1,1':
		case '0,-1':
		case '0,0':
		case '0,1':
		case '1,-1':
		case '1,0':
		case '1,1':
			break;
		default:
			throw `Unexpected diff: ${diff.toString()}`;
		}
		
		this.sampleLog(`Positions after knot ${index} move: ${this.coords[index - 1].toString()} ${this.coords[index].toString()}\n`);
	}

	protected solve(): string {
		for (const line of this.input) {
			this.sampleLog(`Processing line ${line}`);
			const split = line.split(' ');
			const dir = split[0];
			const num = parseInt(split[1]);
			for (let i = 0; i < num; i++) {
				this.moveHead(dir);
				for (let j = 1; j < this.coords.length; j++) {
					this.moveKnot(j);
				}
				this.tailVisited.add(this.coords[this.coords.length - 1].toString());
			}
		}

		return `${this.tailVisited.size}`;
	}

	protected solvePart1(): string {
		return `${this.solve()}`;
	}

	protected solvePart2(): string {
		this.coords = Array(10).fill(new Coord(0, 0));
		return `${this.solve()}`;
	}
}

new Day9Solver().solveForArgs();