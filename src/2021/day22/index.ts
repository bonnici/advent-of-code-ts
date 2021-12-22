import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord3d from '../../common/Coord3d';
import Cube from '../../common/Cube';

const inputRegex = /(on|off) x=([-\d]+)..([-\d]+),y=([-\d]+)..([-\d]+),z=([-\d]+)..([-\d]+)/;

interface RebootStep {
	isOn: boolean,
	from: Coord3d,
	to: Coord3d,
}

class Day22Solver extends Solver {
	private input: Array<RebootStep> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile).map(line => {
			const matched = line.match(inputRegex);
			if (!matched || matched.length !== 8) {
				throw 'invalid input';
			}

			const isOn = matched[1] === 'on';
			const fromX = parseInt(matched[2]);
			const toX = parseInt(matched[3]);
			const fromY = parseInt(matched[4]);
			const toY = parseInt(matched[5]);
			const fromZ = parseInt(matched[6]);
			const toZ = parseInt(matched[7]);

			if (isNaN(fromX) || isNaN(toX) || isNaN(fromY) || isNaN(toY) || isNaN(fromZ) || isNaN(toZ)) {
				throw 'invalid input';
			}

			return { isOn, from: new Coord3d(fromX, fromY, fromZ), to: new Coord3d(toX, toY, toZ) };
		});
	}

	protected solvePart1(): string {
		const onCoords = new Set<string>();

		const initSize = 50;

		this.initProgress(this.init.length);

		for (const step of this.input) {
			this.sampleLog(step);

			const startX = Math.max(step.from.x, initSize * -1);
			const endX = Math.min(step.to.x, initSize);
			const startY = Math.max(step.from.y, initSize * -1);
			const endY = Math.min(step.to.y, initSize);
			const startZ = Math.max(step.from.z, initSize * -1);
			const endZ = Math.min(step.to.z, initSize);

			for (let curX = startX; curX <= endX; curX++) {
				for (let curY = startY; curY <= endY; curY++) {
					for (let curZ = startZ; curZ <= endZ; curZ++) {
						const curCoord = new Coord3d(curX, curY, curZ).toString();
						if (step.isOn) {
							onCoords.add(curCoord);
						} else {
							onCoords.delete(curCoord);
						}
					}
				}
			}

			this.incrementProgress();
		}

		this.stopProgress();

		return `${onCoords.size}`;
	}

	protected solvePart2(): string {
		let onCubes = new Array<Cube>();

		this.initProgress(this.input.length);

		for (const step of this.input) {
			const stepCube = new Cube(
				new Coord3d(step.from.x, step.from.y, step.from.z),
				new Coord3d(step.to.x, step.to.y, step.to.z)
			);

			if (step.isOn) {
				// turning cubes on - need to preserve existing cubes and add any that are left over after intersecting new cube
				// with all existing cubes
				let remainingCubes = [stepCube];

				for (const existing of onCubes) {
					const newRemaining = [];
					for (const remaining of remainingCubes) {
						const updated = Cube.subtract(remaining, existing);
						newRemaining.push(...updated);
					}
					remainingCubes = newRemaining;
				}

				onCubes.push(...remainingCubes);

				this.sampleLog(`After adding leftovers of ${stepCube.toString()}`, onCubes.map(c => `${c.toString()} (${c.size()})`));
			}
			else {
				// turning cubes off - need to split any existing cubes that intersect with the step cube
				const newCubes = [];
				for (const existing of onCubes) {
					const updatedCubes = Cube.subtract(existing, stepCube);
					newCubes.push(...updatedCubes);
				}
				onCubes = newCubes;

				this.sampleLog(`After subtracting ${stepCube.toString()}`, onCubes.map(c => `${c.toString()} (${c.size()})`));
			}


			this.incrementProgress();
		}

		this.stopProgress();

		const totalSize = onCubes.reduce((acc, cur) => acc + cur.size(), 0);
		return `${totalSize}`;
	}
}

new Day22Solver().solveForArgs();