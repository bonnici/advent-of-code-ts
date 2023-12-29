export class Range {
	constructor(public start: number, public endInclusive: number) {
		if (endInclusive < start) {
			throw 'invalid range';
		}
	}

	public static subtract(source: Range, other: Range): Array<Range> {
		// other range does not overlap - source range stays the same
		if (!source.overlaps(other)) {
			return [source.clone()];
		}

		// other range is contained within source range - split into 2 ranges
		if (other.start > source.start && other.endInclusive < source.endInclusive) {
			return [
				new Range(source.start, other.start - 1), 
				new Range(other.endInclusive + 1, source.endInclusive)
			];
		}

		// other range completely covers source range - source range is removed
		if (other.start <= source.start && other.endInclusive >= source.endInclusive) {
			return [];
		}

		// other range overlaps start or end of source range - reduce size of source range
		if (other.start > source.start) {
			return [new Range(source.start, other.start - 1)];
		} else {
			return [new Range(other.endInclusive + 1, source.endInclusive)];
		}
	}

	public size(): number {
		return this.endInclusive - this.start + 1;
	}

	public overlaps(other: Range): boolean {
		return other.start <= this.endInclusive && other.endInclusive >= this.start;
	}

	public clone(): Range {
		return new Range(this.start, this.endInclusive);
	}

	public intersectionWith(other: Range): Range | null {
		if (this.endInclusive < other.start || other.endInclusive < this.start) {
			return null;
		}

		const maxStart = Math.max(this.start, other.start);
		const minEnd = Math.min(this.endInclusive, other.endInclusive);
		return new Range(maxStart, minEnd);
	}

	public toString(): string {
		return `${this.start}...${this.endInclusive}`;
	}
}

// A list of ranges with functions that allow ranges to be added or removed, while keeping them in order and not overlapping.
export class Ranges {
	public ranges: Array<Range> = [];

	public addRange(range: Range) {
		let overlapStartIndex = -1;
		let overlapEndIndex = -1;

		for (const [i, curRange] of this.ranges.entries()) {
			if (curRange.overlaps(range)) {
				if (overlapStartIndex === -1) {
					overlapStartIndex = i;
				}
				overlapEndIndex = i;
			}
		}

		// new range does not overlap with any existing ranges - just add it
		if (overlapStartIndex === -1) {
			this.ranges.push(range);
		}
		// new range overlaps with a single range - increase the span of the overlapping range
		else if (overlapStartIndex === overlapEndIndex) {
			const rangeToUpdate = this.ranges[overlapStartIndex];
			rangeToUpdate.start = Math.min(rangeToUpdate.start, range.start);
			rangeToUpdate.endInclusive = Math.max(rangeToUpdate.endInclusive, range.endInclusive);
		} else {
			// new range overlaps multiple existing ranges - merge those ranges into a new one
			const startRange = this.ranges[overlapStartIndex];
			const endRange = this.ranges[overlapEndIndex];
			const newRange = new Range(Math.min(range.start, startRange.start), Math.max(range.endInclusive, endRange.endInclusive));
			this.ranges.splice(overlapStartIndex, overlapEndIndex - overlapStartIndex + 1, newRange);
		}
		
		this.sortAndCombine();
	}
	
	public subtractRange(range: Range) {
		const oldRanges = [...this.ranges];
		this.ranges = [];

		for (const curRange of oldRanges) {
			const result = Range.subtract(curRange, range);
			this.ranges.push(...(result || []));
		}

		this.sortAndCombine();
	}
	
	public toString(): string {
		return this.ranges.map(r => r.toString()).join(', ');
	}

	private sortAndCombine(): void {
		if (this.ranges.length === 0) {
			return;
		}

		this.ranges.sort((a, b) => a.start - b.start);

		const oldRanges = [...this.ranges];
		this.ranges = [];

		let cur = oldRanges[0];
		let nextIndex = 1;
		while (nextIndex <= oldRanges.length) {
			if (nextIndex === oldRanges.length) {
				this.ranges.push(cur);
				return;
			}

			const next = oldRanges[nextIndex];
			if (cur.endInclusive + 1 === next.start) {
				cur.endInclusive = next.endInclusive;
				nextIndex++;
			} else {
				this.ranges.push(cur);
				cur = next;
				nextIndex++;
			}
		}
	}
}