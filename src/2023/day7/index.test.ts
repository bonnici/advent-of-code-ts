import { Hand } from './index';

describe('joker types', () => {
	test('five of a kind', () => {
		const expectedType = 0;
		expect(new Hand('AAAAA').jokerType).toEqual(expectedType);
		expect(new Hand('JAAAA').jokerType).toEqual(expectedType);
		expect(new Hand('AAJAJ').jokerType).toEqual(expectedType);
		expect(new Hand('AJJJA').jokerType).toEqual(expectedType);
		expect(new Hand('JAJJJ').jokerType).toEqual(expectedType);
		expect(new Hand('JJJJJ').jokerType).toEqual(expectedType);
	});
	test('four of a kind', () => {
		const expectedType = 1;
		expect(new Hand('2AAAA').jokerType).toEqual(expectedType);
		expect(new Hand('J2AAA').jokerType).toEqual(expectedType);
		expect(new Hand('A2JAJ').jokerType).toEqual(expectedType);
		expect(new Hand('AJJJ2').jokerType).toEqual(expectedType);
		expect(new Hand('JAJ2J').jokerType).toEqual(expectedType);
		expect(new Hand('2AJJJ').jokerType).toEqual(expectedType);
		expect(new Hand('AAAJQ').jokerType).toEqual(expectedType);
		expect(new Hand('AJAQJ').jokerType).toEqual(expectedType);
		expect(new Hand('JJAQQ').jokerType).toEqual(expectedType);
		expect(new Hand('AAAQJ').jokerType).toEqual(expectedType);
	});
	test('full house', () => {
		const expectedType = 2;
		expect(new Hand('AAAQQ').jokerType).toEqual(expectedType);
		expect(new Hand('Q222Q').jokerType).toEqual(expectedType);
		expect(new Hand('AJAQQ').jokerType).toEqual(expectedType);
		expect(new Hand('JAAQQ').jokerType).toEqual(expectedType);
	});
	test('three of a kind', () => {
		const expectedType = 3;
		expect(new Hand('3AA2A').jokerType).toEqual(expectedType);
		expect(new Hand('J3A2A').jokerType).toEqual(expectedType);
		expect(new Hand('A3JJ2').jokerType).toEqual(expectedType);
		expect(new Hand('QAJJ3').jokerType).toEqual(expectedType);
	});
});