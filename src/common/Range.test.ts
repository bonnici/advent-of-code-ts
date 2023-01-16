import { Range, Ranges } from './Range';

describe('Range', () => {
	test('constructor and size and toString', () => {
		const range = new Range(-1, 3);
		expect(range.size()).toEqual(5);
		expect(range.toString()).toEqual('-1...3');
	});
	
	describe('overlap', () => {
		test('same range should overlap', () => {
			const range1 = new Range(1, 4);
			const range2 = new Range(1, 4);
			expect(range1.overlaps(range2)).toEqual(true);
			expect(range2.overlaps(range1)).toEqual(true);
		});
		
		test('fully contained within should overlap', () => {
			const range1 = new Range(2, 3);
			const range2 = new Range(1, 4);
			expect(range1.overlaps(range2)).toEqual(true);
			expect(range2.overlaps(range1)).toEqual(true);
		});
		
		test('partially overlapping should overlap', () => {
			const range1 = new Range(4, 10);
			const range2 = new Range(1, 4);
			expect(range1.overlaps(range2)).toEqual(true);
			expect(range2.overlaps(range1)).toEqual(true);
		});
		
		test('outside should not overlap', () => {
			const range1 = new Range(5, 10);
			const range2 = new Range(1, 4);
			expect(range1.overlaps(range2)).toEqual(false);
			expect(range2.overlaps(range1)).toEqual(false);
		});
	});
	
	describe('subtract', () => {
		test('non-overlapping should return source range', () => {
			const range1 = new Range(5, 10);
			const range2 = new Range(1, 4);

			const range1MinusRange2 = Range.subtract(range1, range2);
			expect(range1MinusRange2.length).toEqual(1);
			expect(range1MinusRange2[0].start).toEqual(5);
			expect(range1MinusRange2[0].endInclusive).toEqual(10);

			const range2MinusRange1 = Range.subtract(range2, range1);
			expect(range2MinusRange1.length).toEqual(1);
			expect(range2MinusRange1[0].start).toEqual(1);
			expect(range2MinusRange1[0].endInclusive).toEqual(4);
		});

		test('fully contained should split into two', () => {
			const range1 = new Range(1, 10);
			const range2 = new Range(2, 3);

			const range1MinusRange2 = Range.subtract(range1, range2);
			expect(range1MinusRange2.length).toEqual(2);
			expect(range1MinusRange2[0].start).toEqual(1);
			expect(range1MinusRange2[0].endInclusive).toEqual(1);
			expect(range1MinusRange2[1].start).toEqual(4);
			expect(range1MinusRange2[1].endInclusive).toEqual(10);
		});

		test('fully covered should return empty list', () => {
			const range1 = new Range(1, 10);
			const range2 = new Range(-1, 10);

			const range1MinusRange2 = Range.subtract(range1, range2);
			expect(range1MinusRange2.length).toEqual(0);
		});

		test('non-overlapping start or end should contract source', () => {
			const range1 = new Range(3, 10);
			const range2 = new Range(1, 4);

			const range1MinusRange2 = Range.subtract(range1, range2);
			expect(range1MinusRange2.length).toEqual(1);
			expect(range1MinusRange2[0].start).toEqual(5);
			expect(range1MinusRange2[0].endInclusive).toEqual(10);

			const range2MinusRange1 = Range.subtract(range2, range1);
			expect(range2MinusRange1.length).toEqual(1);
			expect(range2MinusRange1[0].start).toEqual(1);
			expect(range2MinusRange1[0].endInclusive).toEqual(2);
		});
	});
});

describe('Ranges', () => {
	test('add non-overlapping ranges', () => {
		const ranges = new Ranges();

		ranges.addRange(new Range(-1, 3));
		expect(ranges.toString()).toEqual('-1...3');
		
		ranges.addRange(new Range(5, 6));
		expect(ranges.toString()).toEqual('-1...3, 5...6');
		
		ranges.addRange(new Range(-5, -3));
		expect(ranges.toString()).toEqual('-5...-3, -1...3, 5...6');
	});
	
	test('add overlapping ranges', () => {
		const ranges = new Ranges();

		ranges.addRange(new Range(-1, 3));
		expect(ranges.toString()).toEqual('-1...3');
		
		// non-overlapping
		ranges.addRange(new Range(10, 13));
		expect(ranges.toString()).toEqual('-1...3, 10...13');
		
		// fully overlapping single range
		ranges.addRange(new Range(-2, 4));
		expect(ranges.toString()).toEqual('-2...4, 10...13');
		
		// partially overlaps the start of 1 range 
		ranges.addRange(new Range(9, 11));
		expect(ranges.toString()).toEqual('-2...4, 9...13');
		
		// partially overlaps the end of 1 range 
		ranges.addRange(new Range(2, 5));
		expect(ranges.toString()).toEqual('-2...5, 9...13');
		
		// overlaps gap between two ranges
		ranges.addRange(new Range(3, 10));
		expect(ranges.toString()).toEqual('-2...13');
		
		// plugs gap between two ranges
		ranges.addRange(new Range(20, 21));
		expect(ranges.toString()).toEqual('-2...13, 20...21');
		ranges.addRange(new Range(14, 19));
		expect(ranges.toString()).toEqual('-2...21');

		// overlaps gap between multiple ranges
		ranges.addRange(new Range(23, 23));
		ranges.addRange(new Range(25, 30));
		expect(ranges.toString()).toEqual('-2...21, 23...23, 25...30');
		ranges.addRange(new Range(20, 26));
		expect(ranges.toString()).toEqual('-2...30');
		
		// plugs gap between multiple ranges ranges
		ranges.addRange(new Range(32, 33));
		ranges.addRange(new Range(35, 36));
		expect(ranges.toString()).toEqual('-2...30, 32...33, 35...36');
		ranges.addRange(new Range(31, 34));
		expect(ranges.toString()).toEqual('-2...36');
	});
	
	test('subtract ranges', () => {
		const ranges = new Ranges();

		ranges.addRange(new Range(-1, 3));
		ranges.addRange(new Range(10, 13));
		ranges.addRange(new Range(20, 23));
		expect(ranges.toString()).toEqual('-1...3, 10...13, 20...23');
		
		// doesn't overlap any range
		ranges.subtractRange(new Range(-10, -2));
		ranges.subtractRange(new Range(24, 25));
		expect(ranges.toString()).toEqual('-1...3, 10...13, 20...23');

		// subtracts from the middle of a range
		ranges.subtractRange(new Range(21, 21));
		expect(ranges.toString()).toEqual('-1...3, 10...13, 20...20, 22...23');
		
		// subtracts from the end of a range
		ranges.subtractRange(new Range(0, 4));
		expect(ranges.toString()).toEqual('-1...-1, 10...13, 20...20, 22...23');
		
		// subtracts from the start of a range
		ranges.subtractRange(new Range(9, 10));
		expect(ranges.toString()).toEqual('-1...-1, 11...13, 20...20, 22...23');
		
		// subtracts entire range
		ranges.subtractRange(new Range(-2, 2));
		expect(ranges.toString()).toEqual('11...13, 20...20, 22...23');
		
		// subtracts entire range exactly
		ranges.addRange(new Range(-2, 2));
		expect(ranges.toString()).toEqual('-2...2, 11...13, 20...20, 22...23');
		ranges.subtractRange(new Range(-2, 2));
		expect(ranges.toString()).toEqual('11...13, 20...20, 22...23');
		
		// subtracts multiple ranges
		ranges.addRange(new Range(25, 28));
		expect(ranges.toString()).toEqual('11...13, 20...20, 22...23, 25...28');
		ranges.subtractRange(new Range(13, 26));
		expect(ranges.toString()).toEqual('11...12, 27...28');
	});
});