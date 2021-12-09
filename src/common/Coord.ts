/*
Coordinate class for grids.
0,0 is top left corner.
1,0 is 1 square right from top left.
0,1 is 1 square down from top left.
*/

export default class Coord {
	constructor(public x: number, public y: number) {}

	public toString(): string {
		return `${this.x},${this.y}`;
	}

	public left(): Coord {
		return new Coord(this.x - 1, this.y);
	}

	public right(): Coord {
		return new Coord(this.x + 1, this.y);
	}

	public up(): Coord {
		return new Coord(this.x, this.y - 1);
	}

	public down(): Coord {
		return new Coord(this.x, this.y + 1);
	}

}
