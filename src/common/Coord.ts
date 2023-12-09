/*
Coordinate class for grids.
0,0 is top left corner.
1,0 is 1 square right from top left.
0,1 is 1 square down from top left.

x is going left from 0 to width.
y is going down from 0 to height.
*/

export default class Coord {
	constructor(public x: number, public y: number) {}

	public static fromString(str: string): Coord {
		const split = str.split(',');
		if (split.length !== 2) {
			throw 'String is not coord';
		}
		const x = parseInt(split[0]);
		const y = parseInt(split[1]);

		if (isNaN(x) || isNaN(y)) {
			throw 'Coords are not numbers';
		}

		return new Coord(x, y);
	}
	
	public static clone(source: Coord): Coord {
		return Coord.fromString(source.toString());
	}
	
	// Interpreting "diff" as the amount other would need to move to be same as this
	diff(other: Coord) {
		return new Coord(other.x - this.x, other.y - this.y);
	}
	
	// Manhattan distance
	distance(other: Coord) {
		return Math.abs(other.x - this.x) + Math.abs(other.y - this.y);
	}
	
	isValidPosition(gridWidth: number, gridHeight: number) {
		return this.x >= 0 && this.x < gridWidth && this.y >= 0 && this.y < gridHeight;
	}

	public toString(): string {
		return `${this.x},${this.y}`;
	}

	public left(amount = 1): Coord {
		return new Coord(this.x - amount, this.y);
	}

	public right(amount = 1): Coord {
		return new Coord(this.x + amount, this.y);
	}

	public up(amount = 1): Coord {
		return new Coord(this.x, this.y - amount);
	}

	public down(amount = 1): Coord {
		return new Coord(this.x, this.y + amount);
	}

	public upLeft(amount = 1): Coord {
		return new Coord(this.x - amount, this.y - amount);
	}

	public upRight(amount = 1): Coord {
		return new Coord(this.x + amount, this.y - amount);
	}

	public downLeft(amount = 1): Coord {
		return new Coord(this.x - amount, this.y + amount);
	}

	public downRight(amount = 1): Coord {
		return new Coord(this.x + amount, this.y + amount);
	}

	public adjacentCoords(gridWidth: number, gridHeight: number): Array<Coord> {
		return [
			this.up(),
			this.upLeft(),
			this.upRight(),
			this.left(),
			this.right(),
			this.down(),
			this.downLeft(),
			this.downRight(),
		].filter(c => c.isValidPosition(gridWidth, gridHeight));
	}

}
