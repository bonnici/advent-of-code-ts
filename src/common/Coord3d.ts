/*
Coordinate class for 3D positions.
0,0,0 is top left front corner.
1,0,0 is 1 square right from top left front.
0,1,0 is 1 square down from top left front.
0,0,1 is 1 square back from top left front.

x is going right from 0 to width.
y is going down from 0 to height.
z is going back from 0 to depth.
*/

export default class Coord3d {
	constructor(public x: number, public y: number, public z: number) {
	}

	public static fromString(str: string): Coord3d {
		const split = str.split(',');
		if (split.length !== 3) {
			throw 'String is not 3d coord';
		}
		const x = parseInt(split[0]);
		const y = parseInt(split[1]);
		const z = parseInt(split[2]);

		if (isNaN(x) || isNaN(y) || isNaN(z)) {
			throw 'Coords are not numbers';
		}

		return new Coord3d(x, y, z);
	}

	public toString(): string {
		return `${this.x},${this.y},${this.z}`;
	}

	public right(amount = 1): Coord3d {
		return new Coord3d(this.x + amount, this.y, this.z);
	}

	public left(amount = 1): Coord3d {
		return new Coord3d(this.x - amount, this.y, this.z);
	}

	public down(amount = 1): Coord3d {
		return new Coord3d(this.x, this.y + amount, this.z);
	}

	public up(amount = 1): Coord3d {
		return new Coord3d(this.x, this.y - amount, this.z);
	}

	public back(amount = 1): Coord3d {
		return new Coord3d(this.x, this.y, this.z + amount);
	}

	public forward(amount = 1): Coord3d {
		return new Coord3d(this.x, this.y, this.z - amount);
	}
}
