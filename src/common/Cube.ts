/*
3D Cube class with function to split into sub-cubes after an intersection.
*/

import Coord3d from './Coord3d';

export default class Cube {
	// from/to is trusted to be valid (from.x < to.x, etc)
	constructor(public from: Coord3d, public to: Coord3d) {
		// from/to not copied - can't modify them later
	}

	public toString(): string {
		return `${this.from.toString()} -> ${this.to.toString()}`;
	}

	// Subtract "other" from "original", returning new cubes that make up the parts of the original cube that are left
	// over after subtracting out other
	public static subtract(original: Cube, other: Cube): Array<Cube> {
		const newCubes = [];

		let toSlice = original;

		// left slice - take everything to the left of the intersection
		if (toSlice.from.x < other.from.x) {
			const leftSliceResult = Cube.sliceX(toSlice, other.from.x);
			newCubes.push(leftSliceResult[0]);

			if (leftSliceResult.length === 1) {
				// nothing left to slice up
				return newCubes;
			}

			toSlice = leftSliceResult[1];
		}

		// right slice - take everything to the right of the intersection
		if (toSlice.from.x > other.to.x) {
			newCubes.push(toSlice);
			return newCubes;
		}
		if (toSlice.to.x > other.to.x) {
			const rightSliceResult = Cube.sliceX(toSlice, other.to.x + 1);
			if (rightSliceResult.length > 1) {
				newCubes.push(rightSliceResult[1]);
			}

			toSlice = rightSliceResult[0];
		}

		// up slice - take everything above the intersection, ignoring anything to the left or right
		if (toSlice.from.y < other.from.y) {
			const topSliceResult = Cube.sliceY(toSlice, other.from.y);
			newCubes.push(topSliceResult[0]);

			if (topSliceResult.length === 1) {
				// nothing left to slice up
				return newCubes;
			}

			toSlice = topSliceResult[1];
		}

		// down slice - take everything below the intersection, ignoring anything to the left or right
		if (toSlice.from.y > other.to.y) {
			newCubes.push(toSlice);
			return newCubes;
		}
		if (toSlice.to.y > other.to.y) {
			const bottomSliceResult = Cube.sliceY(toSlice, other.to.y + 1);
			if (bottomSliceResult.length > 1) {
				newCubes.push(bottomSliceResult[1]);
			}

			toSlice = bottomSliceResult[0];
		}

		// front slice - take everything in front of the intersection, ignoring anything to the left or right or up or down
		if (toSlice.from.z < other.from.z) {
			const frontSliceResult = Cube.sliceZ(toSlice, other.from.z);
			newCubes.push(frontSliceResult[0]);

			if (frontSliceResult.length === 1) {
				// nothing left to slice up
				return newCubes;
			}

			toSlice = frontSliceResult[1];
		}

		// back slice - take everything behind of the intersection, ignoring anything to the left or right or up or down
		if (toSlice.from.z > other.to.z) {
			newCubes.push(toSlice);
			return newCubes;
		}
		if (toSlice.to.z > other.to.z) {
			const behindSliceResult = Cube.sliceZ(toSlice, other.to.z + 1);
			if (behindSliceResult.length > 1) {
				newCubes.push(behindSliceResult[1]);
			}
		}

		return newCubes;
	}

	// Slice along the X axis - returns 2 cubes (ordered by left then right) if x is within the cube's space, or the
	// original cube
	public static sliceX(toSlice: Cube, x: number): Array<Cube> {
		if (x > toSlice.from.x && x <= toSlice.to.x) {
			const leftCube = new Cube(
				new Coord3d(toSlice.from.x, toSlice.from.y, toSlice.from.z),
				new Coord3d(x - 1, toSlice.to.y, toSlice.to.z),
			);
			const rightCube = new Cube(
				new Coord3d(x, toSlice.from.y, toSlice.from.z),
				new Coord3d(toSlice.to.x, toSlice.to.y, toSlice.to.z),
			);
			return [leftCube, rightCube];
		} else {
			return [toSlice];
		}
	}

	public static sliceY(toSlice: Cube, y: number): Array<Cube> {
		if (y > toSlice.from.y && y <= toSlice.to.y) {
			const topCube = new Cube(
				new Coord3d(toSlice.from.x, toSlice.from.y, toSlice.from.z),
				new Coord3d(toSlice.to.x, y - 1, toSlice.to.z),
			);
			const bottomCube = new Cube(
				new Coord3d(toSlice.from.x, y, toSlice.from.z),
				new Coord3d(toSlice.to.x, toSlice.to.y, toSlice.to.z),
			);
			return [topCube, bottomCube];
		} else {
			return [toSlice];
		}
	}

	public static sliceZ(toSlice: Cube, z: number): Array<Cube> {
		if (z > toSlice.from.z && z <= toSlice.to.z) {
			const frontCube = new Cube(
				new Coord3d(toSlice.from.x, toSlice.from.y, toSlice.from.z),
				new Coord3d(toSlice.to.x, toSlice.to.y, z - 1),
			);
			const backCube = new Cube(
				new Coord3d(toSlice.from.x, toSlice.from.y, z),
				new Coord3d(toSlice.to.x, toSlice.to.y, toSlice.to.z),
			);
			return [frontCube, backCube];
		} else {
			return [toSlice];
		}
	}

	public width(): number {
		return this.to.x - this.from.x + 1;
	}

	public height(): number {
		return this.to.y - this.from.y + 1;
	}

	public depth(): number {
		return this.to.z - this.from.z + 1;
	}

	public size(): number {
		return this.width() * this.height() * this.depth();
	}
}
