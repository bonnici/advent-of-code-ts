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

}
