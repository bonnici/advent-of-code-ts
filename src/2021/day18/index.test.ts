import { Pair } from './index';

describe('fromString', () => {
	test('simple', () => {
		const pair = Pair.fromString('[1,2]');

		expect(pair.parent).toBeUndefined();
		expect(pair.depth).toEqual(0);
		expect(pair.value).toBeUndefined();
		expect(pair.left).not.toBeUndefined();
		expect(pair.right).not.toBeUndefined();

		expect(pair.left?.parent).toBe(pair);
		expect(pair.left?.depth).toEqual(1);
		expect(pair.left?.value).toEqual(1);
		expect(pair.left?.left).toBeUndefined();
		expect(pair.left?.right).toBeUndefined();

		expect(pair.right?.parent).toBe(pair);
		expect(pair.right?.depth).toEqual(1);
		expect(pair.right?.value).toEqual(2);
		expect(pair.right?.left).toBeUndefined();
		expect(pair.right?.right).toBeUndefined();
	});

	test('nested', () => {
		const pair = Pair.fromString('[[[[1,2],[3,4]],[[5,6],[7,8]]],9]');

		expect(pair.value).toBeUndefined();
		expect(pair.parent).toBeUndefined();
		expect(pair.depth).toEqual(0);

		expect(pair.left?.left?.left?.left?.value).toEqual(1);
		expect(pair.left?.left?.left?.left?.depth).toEqual(4);
		expect(pair.left?.left?.left?.left?.parent).toBe(pair.left?.left?.left);
		expect(pair.left?.left?.left?.parent).toBe(pair.left?.left);
		expect(pair.left?.left?.left?.depth).toEqual(3);
		expect(pair.left?.left?.parent).toBe(pair.left);
		expect(pair.left?.left?.depth).toEqual(2);
		expect(pair.left?.parent).toBe(pair);
		expect(pair.left?.depth).toEqual(1);

		expect(pair.left?.left?.left?.right?.value).toEqual(2);
		expect(pair.left?.left?.left?.right?.depth).toEqual(4);

		expect(pair.left?.left?.right?.left?.value).toEqual(3);
		expect(pair.left?.left?.right?.left?.depth).toEqual(4);

		expect(pair.left?.left?.right?.right?.value).toEqual(4);
		expect(pair.left?.left?.right?.right?.depth).toEqual(4);

		expect(pair.left?.right?.left?.left?.value).toEqual(5);
		expect(pair.left?.right?.left?.left?.depth).toEqual(4);

		expect(pair.left?.right?.left?.right?.value).toEqual(6);
		expect(pair.left?.right?.left?.right?.depth).toEqual(4);

		expect(pair.left?.right?.right?.left?.value).toEqual(7);
		expect(pair.left?.right?.right?.left?.depth).toEqual(4);

		expect(pair.left?.right?.right?.right?.value).toEqual(8);
		expect(pair.left?.right?.right?.right?.depth).toEqual(4);

		expect(pair.right?.value).toEqual(9);
		expect(pair.right?.left).toBeUndefined();
		expect(pair.right?.right).toBeUndefined();
		expect(pair.right?.parent).toBe(pair);
		expect(pair.right?.depth).toEqual(1);
	});

	test('complicated', () => {
		const pair = Pair.fromString('[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]');

		expect(pair.left?.left?.left?.value).toEqual(9);
		expect(pair.left?.left?.left?.depth).toEqual(3);

		expect(pair.left?.left?.right?.left?.value).toEqual(3);
		expect(pair.left?.left?.right?.left?.depth).toEqual(4);

		expect(pair.left?.left?.right?.right?.value).toEqual(8);
		expect(pair.left?.left?.right?.right?.depth).toEqual(4);

		expect(pair.left?.right?.left?.left?.value).toEqual(0);
		expect(pair.left?.right?.left?.left?.depth).toEqual(4);

		expect(pair.left?.right?.left?.right?.value).toEqual(9);
		expect(pair.left?.right?.left?.right?.depth).toEqual(4);

		expect(pair.left?.right?.right?.value).toEqual(6);
		expect(pair.left?.right?.right?.depth).toEqual(3);

		expect(pair.right?.left?.left?.left?.value).toEqual(3);
		expect(pair.right?.left?.left?.left?.depth).toEqual(4);

		expect(pair.right?.left?.left?.right?.value).toEqual(7);
		expect(pair.right?.left?.left?.right?.depth).toEqual(4);

		expect(pair.right?.left?.right?.left?.value).toEqual(4);
		expect(pair.right?.left?.right?.left?.depth).toEqual(4);

		expect(pair.right?.left?.right?.right?.value).toEqual(9);
		expect(pair.right?.left?.right?.right?.depth).toEqual(4);

		expect(pair.right?.right?.value).toEqual(3);
		expect(pair.right?.right?.depth).toEqual(2);
	});
});

describe('leftmost/rightmost', () => {
	test('simple', () => {
		const pair = Pair.fromString('[1,2]');

		expect(pair.leftmost()?.value).toEqual(1);
		expect(pair.rightmost()?.value).toEqual(2);
	});

	test('complicated', () => {
		const pair = Pair.fromString('[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]');

		expect(pair.leftmost()?.value).toEqual(9);
		expect(pair.rightmost()?.value).toEqual(3);

		expect(pair.left?.leftmost()?.value).toEqual(9);
		expect(pair.left?.rightmost()?.value).toEqual(6);

		expect(pair.right?.leftmost()?.value).toEqual(3);
		expect(pair.right?.rightmost()?.value).toEqual(3);

		expect(pair.left?.right?.leftmost()?.value).toEqual(0);
		expect(pair.left?.right?.rightmost()?.value).toEqual(6);
	});
});

describe('next/prev', () => {
	test('simple', () => {
		const pair = Pair.fromString('[1,2]');

		expect(pair.next()).toBeUndefined();
		expect(pair.prev()).toBeUndefined();

		expect(pair.left?.next()).toEqual(pair.right);
		expect(pair.left?.prev()).toBeUndefined();

		expect(pair.right?.next()).toBeUndefined();
		expect(pair.right?.prev()).toEqual(pair.left);
	});

	test('complicated', () => {
		const pair = Pair.fromString('[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]');
		const ordered = [9,3,8,0,9,6,3,7,4,9,3];

		let current = pair.leftmost();

		for (const expected of ordered) {
			expect(current?.value).toEqual(expected);
			current = current?.next();
		}
	});
});

describe('magnitude', () => {
	test('simple', () => {
		const pair = Pair.fromString('[9,1]');
		expect(pair.magnitude()).toEqual(29);
	});

	test('recursive', () => {
		const pair = Pair.fromString('[[9,1],[1,9]]');
		expect(pair.magnitude()).toEqual(129);
	});
});

describe('add', () => {
	test('simple', () => {
		const added = Pair.add(Pair.fromString('[1,2]'), Pair.fromString('[[3,4],5]'));

		expect(added.toString()).toEqual('[[1,2],[[3,4],5]]');
		expect(added.left?.depth).toEqual(1);
		expect(added.left?.left?.depth).toEqual(2);
		expect(added.right?.left?.right?.depth).toEqual(3);
		expect(added.right?.left?.right?.value).toEqual(4);
	});

	test('complicated', () => {
		const added = Pair.add(Pair.fromString('[[[[4,3],4],4],[7,[[8,4],9]]]'), Pair.fromString('[1,1]'));

		expect(added.toString()).toEqual('[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]');
	});
});

describe('explode', () => {
	test('example 1', () => {
		const pair = Pair.fromString('[[[[[9,8],1],2],3],4]');

		const didExplode = pair?.left?.left?.left?.left?.explode();

		expect(didExplode).toEqual(true);
		expect(pair.toString()).toEqual('[[[[0,9],2],3],4]');
	});

	test('example 2', () => {
		const pair = Pair.fromString('[7,[6,[5,[4,[3,2]]]]]');

		const didExplode = pair?.right?.right?.right?.right?.explode();

		expect(didExplode).toEqual(true);
		expect(pair.toString()).toEqual('[7,[6,[5,[7,0]]]]');
	});

	test('example 3', () => {
		const pair = Pair.fromString('[[6,[5,[4,[3,2]]]],1]');

		const didExplode = pair?.left?.right?.right?.right?.explode();

		expect(didExplode).toEqual(true);
		expect(pair.toString()).toEqual('[[6,[5,[7,0]]],3]');
	});

	test('example 4', () => {
		const pair = Pair.fromString('[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]');

		const didExplode = pair?.left?.right?.right?.right?.explode();

		expect(didExplode).toEqual(true);
		expect(pair.toString()).toEqual('[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]');
	});

	test('example 5', () => {
		const pair = Pair.fromString('[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]');

		const didExplode = pair?.right?.right?.right?.right?.explode();

		expect(didExplode).toEqual(true);
		expect(pair.toString()).toEqual('[[3,[2,[8,0]]],[9,[5,[7,0]]]]');
	});

	test('no explode needed', () => {
		const pair = Pair.fromString('[[3,[2,[8,0]]],[9,[5,[7,0]]]]');

		const didExplode = pair.explode();

		expect(didExplode).toEqual(false);
		expect(pair.toString()).toEqual('[[3,[2,[8,0]]],[9,[5,[7,0]]]]');
	});
});

describe('split', () => {
	test('example 1', () => {
		const pair = Pair.fromString('10');

		const didSplit = pair.split();

		expect(didSplit).toEqual(true);
		expect(pair.toString()).toEqual('[5,5]');
	});

	test('example 2', () => {
		const pair = Pair.fromString('11');

		const didSplit = pair.split();

		expect(didSplit).toEqual(true);
		expect(pair.toString()).toEqual('[5,6]');
	});

	test('example 3', () => {
		const pair = Pair.fromString('12');

		const didSplit = pair.split();

		expect(didSplit).toEqual(true);
		expect(pair.toString()).toEqual('[6,6]');
	});

	test('no split needed', () => {
		const pair = Pair.fromString('9');

		const didSplit = pair.split();

		expect(didSplit).toEqual(false);
		expect(pair.toString()).toEqual('9');
	});
});

describe('reduce', () => {
	test('explode only', () => {
		// example 4 in explode tests above
		const pair = Pair.fromString('[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]');

		let isReduced = pair.reduce(); // [7,3] reduced first

		expect(isReduced).toEqual(true);
		expect(pair.toString()).toEqual('[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]');

		isReduced = pair.reduce(); // [3,2] should be exploded next

		expect(isReduced).toEqual(true);
		expect(pair.toString()).toEqual('[[3,[2,[8,0]]],[9,[5,[7,0]]]]');

		isReduced = pair.reduce(); // nothing more to reduce

		expect(isReduced).toEqual(false);
		expect(pair.toString()).toEqual('[[3,[2,[8,0]]],[9,[5,[7,0]]]]');
	});

	test('full example', () => {
		const pair = Pair.add(Pair.fromString('[[[[4,3],4],4],[7,[[8,4],9]]]'), Pair.fromString('[1,1]'));
		expect(pair.toString()).toEqual('[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]');

		let reduced = pair.reduce(); // explode
		expect(reduced).toEqual(true);
		expect(pair.toString()).toEqual('[[[[0,7],4],[7,[[8,4],9]]],[1,1]]');

		reduced = pair.reduce(); // explode
		expect(reduced).toEqual(true);
		expect(pair.toString()).toEqual('[[[[0,7],4],[15,[0,13]]],[1,1]]');

		reduced = pair.reduce(); // split
		expect(reduced).toEqual(true);
		expect(pair.toString()).toEqual('[[[[0,7],4],[[7,8],[0,13]]],[1,1]]');

		reduced = pair.reduce(); // split
		expect(reduced).toEqual(true);
		expect(pair.toString()).toEqual('[[[[0,7],4],[[7,8],[0,[6,7]]]],[1,1]]');

		reduced = pair.reduce(); // explode
		expect(reduced).toEqual(true);
		expect(pair.toString()).toEqual('[[[[0,7],4],[[7,8],[6,0]]],[8,1]]');

		reduced = pair.reduce(); // nothing left to do
		expect(reduced).toEqual(false);
		expect(pair.toString()).toEqual('[[[[0,7],4],[[7,8],[6,0]]],[8,1]]');
	});
});