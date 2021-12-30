import { Pair } from './index';

describe('constructor', () => {
	test('simple', () => {
		const pair = new Pair('[1,2]');

		expect(pair.value).toBeUndefined();

		expect(pair.left?.value).toEqual(1);
		expect(pair.left?.left).toBeUndefined();
		expect(pair.left?.right).toBeUndefined();

		expect(pair.right?.value).toEqual(2);
		expect(pair.right?.left).toBeUndefined();
		expect(pair.right?.right).toBeUndefined();
	});

	test('nested', () => {
		const pair = new Pair('[[[[1,2],[3,4]],[[5,6],[7,8]]],9]');

		expect(pair.value).toBeUndefined();

		expect(pair.left?.left?.left?.left?.value).toEqual(1);
		expect(pair.left?.left?.left?.right?.value).toEqual(2);
		expect(pair.left?.left?.right?.left?.value).toEqual(3);
		expect(pair.left?.left?.right?.right?.value).toEqual(4);
		expect(pair.left?.right?.left?.left?.value).toEqual(5);
		expect(pair.left?.right?.left?.right?.value).toEqual(6);
		expect(pair.left?.right?.right?.left?.value).toEqual(7);
		expect(pair.left?.right?.right?.right?.value).toEqual(8);

		expect(pair.right?.value).toEqual(9);
		expect(pair.right?.left).toBeUndefined();
		expect(pair.right?.right).toBeUndefined();
	});
});