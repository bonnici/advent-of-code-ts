import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord3d from '../../common/Coord3d';

interface Scanner {
	coords: Array<Coord3d>;
}

class Day19Solver extends Solver {
	private scanners: Array<Scanner> = [];

	public init(inputFile: string): void {
		const input = InputParser.readLinesInGroups(inputFile);

		for (const group of input) {
			const coords = [];
			for (let i = 1; i < group.length; i++) {
				coords.push(Coord3d.fromString(group[i]));
			}
			this.scanners.push({ coords });
		}
	}

	protected solvePart1(): string {
		// for each scanner (28)
		//   for each other scanner (27)
		//     for each pair of coordinates (26*26)
		//       for each orientation (48)
		this.initProgress(28*27*26*26*48);

		// Taking scanner 0 as the "correct" location and orientation
		const matchedScanners = new Set([0]);

		for (let i = 0; i < this.scanners.length; i++) {
			const scanner = this.scanners[i];
			const coordSet = new Set(scanner.coords.map(c => c.toString()));

			for (let j = 0; j < this.scanners.length; j++) {
				if (i === j) {
					continue;
				}
				if (matchedScanners.has(j)) {
					continue;
				}

				const other = this.scanners[j];

				const isMatched = this.findMatch(scanner, other, coordSet);
				if (isMatched) {
					this.sampleLog(`Found match - ${i} and ${j}`);
					matchedScanners.add(j);
				}
			}
		}

		this.stopProgress();

		return `${'todo'}`;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
	}

	// Change orientation of a coordinate. inverse is 0-7 to invert none or all of x, y, z. swap is 0-5 to swap order
	// of x,y,z. The question says there are 24 orientations so there must be some duplicates here or something.
	private reorient(coord: Coord3d, inverse: number, swap: number): Coord3d {
		let rotated;
		switch (inverse) {
		case 0:
			// 1, 1, 1
			rotated = new Coord3d(coord.x, coord.y, coord.z);
			break;
		case 1:
			// 1, 1, -1
			rotated = new Coord3d(coord.x, coord.y, coord.z * -1);
			break;
		case 2:
			// 1, -1, 1
			rotated = new Coord3d(coord.x, coord.y * -1, coord.z);
			break;
		case 3:
			// 1, -1, -1
			rotated = new Coord3d(coord.x, coord.y * -1, coord.z * -1);
			break;
		case 4:
			// -1, 1, 1
			rotated = new Coord3d(coord.x * -1, coord.y, coord.z);
			break;
		case 5:
			// -1, 1, -1
			rotated = new Coord3d(coord.x * -1, coord.y, coord.z * -1);
			break;
		case 6:
			// -1, -1, 1
			rotated = new Coord3d(coord.x * -1, coord.y * -1, coord.z);
			break;
		case 7:
			// -1, -1, -1
			rotated = new Coord3d(coord.x * -1, coord.y * -1, coord.z * -1);
			break;
		default:
			throw 'invalid inverse';
		}

		switch (swap) {
		case 0:
			// x, y, z
			return new Coord3d(rotated.x, rotated.y, rotated.z);
		case 1:
			// x, z, y
			return new Coord3d(rotated.x, rotated.z, rotated.y);
		case 2:
			// y, x, z
			return new Coord3d(rotated.y, rotated.x, rotated.z);
		case 3:
			// y, z, x
			return new Coord3d(rotated.y, rotated.z, rotated.x);
		case 4:
			// z, x, y
			return new Coord3d(rotated.z, rotated.x, rotated.y);
		case 5:
			// z, y, x
			return new Coord3d(rotated.z, rotated.y, rotated.x);
		default:
			throw 'invalid swap';
		}
	}

	private findMatch(scanner: Scanner, other: Scanner, coordSet: Set<string>): boolean {
		for (const origin of scanner.coords) {
			for (const target of other.coords) {
				for (let inverse = 0; inverse < 8; inverse++) {
					for (let swap = 0; swap < 6; swap++) {
						// assume that this pair or coordinates is the same beacon and check the rest of the beacons
						const reoriented = this.reorient(target, inverse, swap);
						const xDelta = origin.x - reoriented.x;
						const yDelta = origin.y - reoriented.y;
						const zDelta = origin.z - reoriented.z;

						const allReoriented = other.coords.map(c => {
							const reorient = this.reorient(c, inverse, swap);
							return new Coord3d(reorient.x + xDelta, reorient.y + yDelta, reorient.z + zDelta);
						});
						const reorientedStrings = allReoriented.map(c => c.toString());
						const matches = reorientedStrings.reduce((acc, cur) => coordSet.has(cur) ? acc + 1 : acc, 0);

						if (matches >= 12) {
							this.sampleLog(`Found match - inverse=${inverse}, swap=${swap}`);
							return true;
						}

						this.incrementProgress();
					}
				}
			}
		}

		return false;
	}
}

new Day19Solver().solveForArgs();