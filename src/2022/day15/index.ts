import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord from '../../common/Coord';
import { Range, Ranges } from '../../common/Range';

interface Sensor {
	sensorPos: Coord,
	beaconPos: Coord,
	distance: number,
}

// Sensor at x=2, y=18: closest beacon is at x=-2, y=15
const inputRe = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/;

class Day15Solver extends Solver {
	private input: Array<Sensor> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesWithTransform(inputFile, line => {
			const match = line.match(inputRe) || [];

			const sensorPos = new Coord(parseInt(match[1]),  parseInt(match[2]));
			const beaconPos = new Coord(parseInt(match[3]),  parseInt(match[4]));

			return {
				sensorPos,
				beaconPos, 
				distance: sensorPos.distance(beaconPos)
			};
		});
	}

	protected solvePart1(): string {
		const targetRow = process.env.SAMPLE_FILE ? 10 : 2000000;
		const blockedXRanges = new Ranges();

		this.initProgress(this.input.length + 1);

		this.input.forEach(sensor => {
			const yDiff = Math.abs(sensor.sensorPos.y - targetRow);
			// const blockedWidth = (sensor.distance * 2 + 1) - (yDiff * 2);
			// const blockedXDiff = ((blockedWidth - 1) / 2);
			const blockedXDiff = sensor.distance - yDiff;
			if (blockedXDiff > 0) {
				blockedXRanges.addRange(new Range(sensor.sensorPos.x - blockedXDiff, sensor.sensorPos.x + blockedXDiff));
			}

			this.incrementProgress();
		});

		this.input.filter(sensor => sensor.sensorPos.y === targetRow).forEach(sensor => {
			blockedXRanges.subtractRange(new Range(sensor.sensorPos.x, sensor.sensorPos.x));
		});
		this.input.filter(sensor => sensor.beaconPos.y === targetRow).forEach(sensor => {
			blockedXRanges.subtractRange(new Range(sensor.beaconPos.x, sensor.beaconPos.x));
		});
		this.sampleLog(blockedXRanges.ranges);
		this.incrementProgress();

		this.stopProgress();

		const totalSize = blockedXRanges.ranges.reduce((acc, cur) => acc + cur.size(), 0);

		return `${totalSize}`;
	}

	protected solvePart2(): string {
		const max = process.env.SAMPLE_FILE ? 20 : 4000000;

		this.initProgress(max + 1);

		for (let targetRow = 0; targetRow <= max; targetRow++) {
			this.sampleLog(`Checking row ${targetRow}`);

			const blockedXRanges = new Ranges();			
			this.input.forEach(sensor => {
				const yDiff = Math.abs(sensor.sensorPos.y - targetRow);
				const blockedXDiff = sensor.distance - yDiff;
				if (blockedXDiff > 0) {
					const rangeStart = Math.max(0, sensor.sensorPos.x - blockedXDiff);
					const rangeEnd = Math.min(max, sensor.sensorPos.x + blockedXDiff);
					blockedXRanges.addRange(new Range(rangeStart, rangeEnd));
				}
			});

			const totalSize = blockedXRanges.ranges.reduce((acc, cur) => acc + cur.size(), 0);
			if (totalSize < max + 1) {
				this.sampleLog(' Found beacon row!');
				this.sampleLog(blockedXRanges.toString());

				if (blockedXRanges.ranges.length !== 2) {
					throw 'Unexpected range count';
				} else {
					this.stopProgress();

					const y = targetRow;
					const x = blockedXRanges.ranges[0].endInclusive + 1;
					return `${(x * 4000000) + y}`;
				}
			}

			this.incrementProgress();
		}

		this.stopProgress();
		return 'No result :(';
	}
}

new Day15Solver().solveForArgs();