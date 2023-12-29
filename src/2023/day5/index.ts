import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class MapRange {
	constructor(public destStart: number, public sourceStart: number, public rangeLength: number) {}

	public outputToInputOffset(): number {
		return this.sourceStart - this.destStart;
	}

	public toString(): string {
		return `${this.destStart} ${this.sourceStart} ${this.rangeLength} (${this.sourceStart}-${this.sourceStart + this.rangeLength} -> ${this.destStart}-${this.destStart + this.rangeLength})`;
	}
}

class GenericRange {
	constructor(public start: number, public length: number) {}

	public intersectionWith(other: GenericRange): GenericRange | null {
		if (this.start + this.length <= other.start || other.start + other.length <= this.start) {
			return null;
		}

		const maxStart = Math.max(this.start, other.start);
		const minEnd = Math.min(this.start + this.length, other.start + other.length);
		return new GenericRange(maxStart, minEnd - maxStart);
	}
	
	public toString(): string {
		return `${this.start}-${this.start + this.length}`;
	}
}

class OrderedMap {
	public ranges: Array<MapRange> = [];

	constructor(lines: Array<string>, sortByDestination = false) {
		for (let i = 1; i < lines.length; i++) {
			const split = lines[i].split(' ').map(n => parseInt(n.trim()));
			this.ranges.push(new MapRange(split[0], split[1], split[2]));
		}

		this.sort(sortByDestination);
	}
	
	sort(byDestination = false) {
		if (byDestination) {
			this.ranges.sort((a, b) => a.destStart - b.destStart);
		} else {
			this.ranges.sort((a, b) => a.sourceStart - b.sourceStart);
		}
	}

	public lookup(input: number): number {
		if (input < this.ranges[0].sourceStart) {
			return input;
		}

		for (const range of this.ranges) {
			if (input >= range.sourceStart && input < range.sourceStart + range.rangeLength) {
				const diff = range.destStart - range.sourceStart;
				return input + diff;
			}

			if (input < range.sourceStart) {
				return input;
			}
		}

		return input;
	}
	
	public *fillRanges(finalEnd = 0): Generator<MapRange> {
		let curStart = 0;		
		for (const range of this.ranges) {
			const start = range.destStart;
			if (start > curStart) {
				yield new MapRange(curStart, curStart, start - curStart);
			}
			yield range;
			curStart = start + range.rangeLength;
		}

		if (finalEnd >= curStart) {
			yield new MapRange(curStart, curStart, finalEnd - curStart);
		}
	}
}

class Day5Solver extends Solver {
	private groups: Array<Array<string>> = [];
	private maps: Array<OrderedMap> = [];
	private seeds: Array<number> = [];
	private seedRanges: Array<GenericRange> = [];

	public init(inputFile: string): void {
		this.groups = InputParser.readLinesInGroups(inputFile);
	}
	
	protected initFromInput(part2 = false): void {
		const seedNums = this.groups[0][0].split(':')[1].split(' ').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
		if (part2) {
			for (let i = 0; i < seedNums.length; i += 2) {
				this.seedRanges.push(new GenericRange(seedNums[i], seedNums[i + 1]));
			}
		} else {
			this.seeds = seedNums;
		}

		for (let i = 1; i < this.groups.length; i++) {
			if (this.groups[i].length > 1) {
				this.maps.push(new OrderedMap(this.groups[i], part2));
			}
		}
	}

	protected solvePart1(): string {
		this.initFromInput();
		let minLocation = Number.MAX_SAFE_INTEGER;
		for (const seed of this.seeds) {
			let location = seed;
			for (const map of this.maps) {
				location = map.lookup(location);
			}
			minLocation = Math.min(minLocation, location);
		}
		return `${minLocation}`;
	}

	protected solvePart2(): string {
		this.initFromInput(true);
		const locationMapIndex = this.maps.length - 1;
		for (const locationMapRange of this.maps[locationMapIndex].fillRanges()) {
			this.sampleLog(`Working backwards from location range ${locationMapRange}`);
			for (const range of this.getInputRanges(locationMapIndex, new GenericRange(locationMapRange.sourceStart, locationMapRange.rangeLength))) {
				for (const seedRange of this.seedRanges) {
					const intersection = range.intersectionWith(seedRange);
					if (intersection !== null) {
						this.sampleLog(`Found best seed range ${intersection}, looking up location of seed ${intersection.start}`);
						let location = intersection.start;
						let curIndex = 0;
						for (const map of this.maps) {
							map.sort(false);
							this.sampleLog(`(L${curIndex}) looking up location ${location}`);
							location = map.lookup(location);
							this.sampleLog(`(L${curIndex}) found location ${location}`);
							curIndex++;
						}
						return `${location}`;
					}
				}
			}
		}
		return 'should have returned by now';
	}

	protected *getInputRanges(mapIndex: number, sourceRange: GenericRange): Generator<GenericRange> {
		if (mapIndex === 0) {
			this.sampleLog(`(L${mapIndex}) Reached seed map, returning source range ${sourceRange}`);
			yield sourceRange;
		} else {
			const prevMapIndex = mapIndex - 1;
			let haveReturned = false;
			for (const prevMapRange of this.maps[prevMapIndex].fillRanges(sourceRange.start + sourceRange.length)) {
				const intersection = sourceRange.intersectionWith(new GenericRange(prevMapRange.destStart, prevMapRange.rangeLength));
				if (intersection !== null) {
					const inputRange = new GenericRange(intersection.start + prevMapRange.outputToInputOffset(), intersection.length);
					this.sampleLog(`(L${mapIndex}) To get ${sourceRange} from ${prevMapRange}, we need input ${inputRange}`);
					yield* this.getInputRanges(mapIndex-1, inputRange);
					haveReturned = true;
				} else if (haveReturned) {
					this.sampleLog(`(L${mapIndex}) Got to end of intersections for ${sourceRange} from ${prevMapRange}`);
					return;
				} else {
					this.sampleLog(`(L${mapIndex}) No way to get ${sourceRange} from ${prevMapRange}`);
					continue;
				}
			}
		}
	}
}

new Day5Solver().solveForArgs();