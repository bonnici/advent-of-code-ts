import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord3d from '../../common/Coord3d';

interface Scanner {
	coords: Array<Coord3d>;
}

interface OrientedScanner extends Scanner {
	relativePosition: Coord3d;
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
		const orientedScanners = this.orientScanners();

		const allCoords = new Set();
		for (const scanner of orientedScanners) {
			for (const coord of scanner.coords) {
				allCoords.add(coord.toString());
			}
		}

		return `${allCoords.size}`;
	}

	protected solvePart2(): string {
		const orientedScanners = this.orientScanners();

		let maxDistance = 0;

		for (let i = 0; i < orientedScanners.length; i++) {
			const first = orientedScanners[i];
			for (let j = i + 1; j < orientedScanners.length; j++) {
				const second = orientedScanners[j];
				const distance =
					Math.abs(first.relativePosition.x - second.relativePosition.x) +
					Math.abs(first.relativePosition.y - second.relativePosition.y) +
					Math.abs(first.relativePosition.z - second.relativePosition.z);
				maxDistance = Math.max(maxDistance, distance);
			}
		}

		return `${maxDistance}`;
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

	private findMatch(scanner: Scanner, other: Scanner, coordSet: Set<string>): OrientedScanner | undefined {
		for (let i = 0; i < scanner.coords.length - 11; i++) { // if there are less than 12 coords left to check, we can't possibly find 12 matches
			const origin = scanner.coords[i];

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
							return { coords: allReoriented, relativePosition: new Coord3d(xDelta, yDelta, zDelta) };
						}
					}
				}
			}
		}

		return undefined;
	}

	private orientScanners(): Array<OrientedScanner> {
		this.initProgress(this.scanners.length);

		// Taking scanner 0 as the "correct" location and orientation
		const orientedScanners = [{ coords: this.scanners[0].coords, relativePosition: new Coord3d(0, 0, 0) }];
		const orientedIndices = new Set([0]);
		this.incrementProgress();
		const consideredIndices: Set<number> = new Set();

		// consider each oriented scanner in turn until there is nothing left to orient
		while (orientedIndices.size < this.scanners.length) {
			for (let i = 0; i < orientedScanners.length; i++) {
				if (consideredIndices.has(i)) {
					continue;
				}

				const scanner = orientedScanners[i];
				const coordSet = new Set(scanner.coords.map(c => c.toString()));

				// check all unoriented scanners and see if we can orient it to the current one
				for (let j = 0; j < this.scanners.length; j++) {
					if (orientedIndices.has(j)) {
						continue;
					}
					const other = this.scanners[j];
					this.sampleLog(`Checking ${i} and ${j}`);

					const orientedScanner = this.findMatch(scanner, other, coordSet);
					if (orientedScanner) {
						this.sampleLog(`Found match - ${i} and ${j}`);
						orientedScanners.push(orientedScanner);
						orientedIndices.add(j);
						this.incrementProgress();
					}
				}

				consideredIndices.add(i);
			}
		}

		this.stopProgress();
		return orientedScanners;
	}
}

new Day19Solver().solveForArgs();