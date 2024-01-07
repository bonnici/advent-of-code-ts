import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

class Day10Solver extends Solver {
	private grid: GenericGrid<string> = GenericGrid.blankStringGrid();

	public init(inputFile: string): void {
		this.grid = InputParser.readLinesAsCharGrid(inputFile);
	}

	protected solvePart1(): string {
		const mainLoop = this.findMainLoop();
		return `${Math.ceil(mainLoop.size / 2)}`;
	}

	private connectsUp(c: Coord): boolean {
		const piece = this.grid.safeGet(c);
		const up = this.grid.safeGet(c.up());
		return (piece === 'S' || piece === '|' || piece === 'L' || piece === 'J') &&
			(up === '|' || up === '7' || up === 'F');
	}

	private connectsDown(c: Coord): boolean {
		const piece = this.grid.safeGet(c);
		const down = this.grid.safeGet(c.down());
		return (piece === 'S' || piece === '|' || piece === '7' || piece === 'F')  &&
			(down === '|' || down === 'L' || down === 'J');
	}

	private connectsLeft(c: Coord): boolean {
		const piece = this.grid.safeGet(c);
		const left = this.grid.safeGet(c.left());
		return (piece === 'S' || piece === '-' || piece === '7' || piece === 'J') &&
			(left === '-' || left === 'L' || left === 'F');
	}

	private connectsRight(c: Coord): boolean {
		const piece = this.grid.safeGet(c);
		const right = this.grid.safeGet(c.right());
		return (piece === 'S' || piece === '-' || piece === 'L' || piece === 'F') && 
			(right === '-' || right === 'J' || right === '7');
	}

	private followPipe(start: Coord, visited: Set<string>): Coord | undefined {
		if (this.connectsUp(start) && !visited.has(start.up().toString())) return start.up();
		if (this.connectsDown(start) && !visited.has(start.down().toString())) return start.down();
		if (this.connectsLeft(start) && !visited.has(start.left().toString())) return start.left();
		if (this.connectsRight(start) && !visited.has(start.right().toString())) return start.right();
		return undefined;
	}

	private findMainLoop(): Set<string> {
		const start = this.grid.findFirst('S');
		if (start === undefined) {
			throw new Error('No start found');
		}

		const visited = new Set<string>();
		visited.add(start.toString());
		
		// From start, find first 2 connected pipes
		const coords: Array<Coord> = [];
		if (this.connectsUp(start)) coords.push(start.up());
		if (this.connectsDown(start)) coords.push(start.down());
		if (this.connectsLeft(start)) coords.push(start.left());
		if (this.connectsRight(start)) coords.push(start.right());

		if (coords.length !== 2) { 
			throw new Error(`Expected 2 coords, got ${coords.length}`);
		}

		// Follow coords until we reach a visited section
		for (;;) {
			const curCoord = coords.pop();
			if (curCoord === undefined) {
				throw new Error('No more coords');
			}
			visited.add(curCoord.toString());
			const nextCoord = this.followPipe(curCoord, visited);

			if (nextCoord === undefined) {
				break;
			}
			coords.push(nextCoord);
		}

		return visited;
	}
 
	protected solvePart2(): string {
		const mainLoop = this.findMainLoop();

		// Remove all non-loop tiles
		this.grid.forEachCoord(c => {
			// non-loop tiles get changed to a single dot and 3 "non-countable" dots
			if (!mainLoop.has(c.toString())) {
				this.grid.setC(c, '.');
			}
		});
		this.sampleLog(this.grid.toString());

		// Build a new grid, increasing the size 4x so that a fill algorithm can squeeze between the "gaps"
		const bigGrid = new GenericGrid(this.grid.width * 2, this.grid.height * 2, () => 'x');
		this.grid.forEachCoord(c => {
			const tile = this.grid.safeGet(c);
			switch (tile) {
			case '.':
				// Each new 4x "dot" tile should only contain 1 countable "dot"
				bigGrid.set(c.x * 2, c.y * 2, '.');
				bigGrid.set((c.x * 2) + 1, c.y * 2, ',');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, ',');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			case '|':
				bigGrid.set(c.x * 2, c.y * 2, '│');
				bigGrid.set((c.x * 2) + 1, c.y * 2, ',');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, '|');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			case '-':
			case 'S': // S is a - in both sample and input files
				bigGrid.set(c.x * 2, c.y * 2, '─');
				bigGrid.set((c.x * 2) + 1, c.y * 2, '─');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, ',');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			case 'L':
				bigGrid.set(c.x * 2, c.y * 2, '└');
				bigGrid.set((c.x * 2) + 1, c.y * 2, '─');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, ',');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			case 'J':
				bigGrid.set(c.x * 2, c.y * 2, '┘');
				bigGrid.set((c.x * 2) + 1, c.y * 2, ',');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, ',');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			case '7':
				bigGrid.set(c.x * 2, c.y * 2, '┐');
				bigGrid.set((c.x * 2) + 1, c.y * 2, ',');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, '│');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			case 'F':
				bigGrid.set(c.x * 2, c.y * 2, '┌');
				bigGrid.set((c.x * 2) + 1, c.y * 2, '─');
				bigGrid.set(c.x * 2, (c.y * 2) + 1, '│');
				bigGrid.set((c.x * 2) + 1, (c.y * 2) + 1, ',');
				break;
			default:
				throw new Error(`Unknown tile ${tile}`);
			}
		});
		this.sampleLog('\n');
		this.sampleLog(bigGrid.toString());

		// Now find all the dots outside the grid by filling in from each edge
		const toCheck = [];
		for (let x = 0; x < bigGrid.width; x++) {
			toCheck.push(new Coord(x, 0).toString());
			toCheck.push(new Coord(x, bigGrid.height - 1).toString());
		}
		for (let y = 0; y < bigGrid.height; y++) {
			toCheck.push(new Coord(0, y).toString());
			toCheck.push(new Coord(bigGrid.width - 1, y).toString());
		}

		const visited = new Set<string>();
		while (toCheck.length > 0) {
			const cur = toCheck.pop();
			this.fillOutsideLoop(Coord.fromString(cur || ''), bigGrid, toCheck, visited);
		}
		this.sampleLog('\n');
		this.sampleLog(bigGrid.toString());


		// Since we've changed all the tiles outside the loop, the number of tiles inside the original loop is the count of dots
		return `${bigGrid.countOccurrences('.')}`;
	}

	private fillOutsideLoop(c: Coord, grid: GenericGrid<string>, toCheck: Array<string>, visited: Set<string>) {
		// if the tile is visited or a non-dot/comma, don't continue
		const tile = grid.safeGet(c);
		if (tile === undefined || visited.has(c.toString()) || (tile !== ',' && tile !== '.')) {
			visited.add(c.toString());
			return;
		}
		
		visited.add(c.toString());

		// Otherwise if it's a dot, change it to an O
		if (tile === '.') {
			grid.setC(c, 'O');
		}

		// Recurse through all adjascent tiles
		for (const adjacent of c.adjacentCoords(grid.width, grid.height, false)) {
			toCheck.push(adjacent.toString());
		}
	}
}

new Day10Solver().solveForArgs();