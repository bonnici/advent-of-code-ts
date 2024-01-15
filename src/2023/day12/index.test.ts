import { Day12Solver } from './index';

describe('countArrangementsRecursive', () => {
	test('misc tests', () => {
		expect(Day12Solver.countArrangementsRecursive('?#.?..?.##.###?', [2,1,2,3], new Map())).toEqual(2);
		expect(Day12Solver.countArrangementsRecursive('?#.?..?.##.###?', [2,5,1], new Map())).toEqual(0);
		expect(Day12Solver.countArrangementsRecursive('????#??.##?????', [1,3,7], new Map())).toEqual(6);
		expect(Day12Solver.countArrangementsRecursive('????????#???', [2,3], new Map())).toEqual(15);
	});
});