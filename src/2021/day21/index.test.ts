import { GameState } from './index';

describe('GameState', () => {
	test('toString', () => {
		const gameState = new GameState(1, 2, 3, 40);
		expect(gameState.toString()).toEqual('1_2_3_40');
	});

	test('fromString', () => {
		const gameState = GameState.fromString('1_2_3_40');
		expect(gameState.player1Pos).toEqual(1);
		expect(gameState.player1Score).toEqual(2);
		expect(gameState.player2Pos).toEqual(3);
		expect(gameState.player2Score).toEqual(40);
	});

	describe('winner', () => {
		test('player 1 wins', () => {
			const gameState = new GameState(1, 21, 2, 1);
			expect(gameState.winner()).toEqual(1);
		});

		test('player 2 wins', () => {
			const gameState = new GameState(1, 20, 2, 100);
			expect(gameState.winner()).toEqual(2);
		});

		test('no winner', () => {
			const gameState = new GameState(1, 2, 20, 0);
			expect(gameState.winner()).toEqual(0);
		});
	});

	describe('roll', () => {
		test('player 1 small roll', () => {
			const gameState = new GameState(4, 5, 1, 1);
			const afterRoll = gameState.roll(1, 3);
			expect(afterRoll.player1Pos).toEqual(7);
			expect(afterRoll.player1Score).toEqual(12);
			expect(afterRoll.player2Pos).toEqual(1);
			expect(afterRoll.player2Score).toEqual(1);
		});

		test('player 2 large roll', () => {
			const gameState = new GameState(4, 5, 6, 7);
			const afterRoll = gameState.roll(2, 9);
			expect(afterRoll.player1Pos).toEqual(4);
			expect(afterRoll.player1Score).toEqual(5);
			expect(afterRoll.player2Pos).toEqual(5);
			expect(afterRoll.player2Score).toEqual(12);
		});
	});
});