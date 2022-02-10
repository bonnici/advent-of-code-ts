import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import CircularArray from '../../common/CircularArray';

export class GameState {
	constructor(public player1Pos: number, public player1Score: number, public player2Pos: number, public player2Score: number) {}

	public static fromString(input: string): GameState {
		const split = input.split('_');
		if (split.length !== 4) {
			throw 'invalid string';
		}
		return new GameState(parseInt(split[0]), parseInt(split[1]), parseInt(split[2]), parseInt(split[3]));
	}

	public toString(): string {
		return `${this.player1Pos}_${this.player1Score}_${this.player2Pos}_${this.player2Score}`;
	}

	public winner(): number {
		if (this.player1Score > 20) {
			return 1;
		} else if (this.player2Score > 20) {
			return 2;
		} else {
			return 0;
		}
	}

	public roll(player: number, roll: number): GameState {
		if (player !== 1 && player !== 2) {
			throw 'invalid player';
		}

		if (roll < 3 || roll > 9) {
			throw 'invalid roll';
		}

		if (player === 1) {
			let newPos = this.player1Pos + roll;
			if (newPos > 10) {
				newPos -= 10;
			}
			const newScore = this.player1Score + newPos;

			return new GameState(newPos, newScore, this.player2Pos, this.player2Score);
		} else {
			let newPos = this.player2Pos + roll;
			if (newPos > 10) {
				newPos -= 10;
			}
			const newScore = this.player2Score + newPos;

			return new GameState(this.player1Pos, this.player1Score, newPos, newScore);
		}
	}
}

class Day21Solver extends Solver {
	private player1Position = 0;
	private player2Position = 0;

	public init(inputFile: string): void {
		const input = InputParser.readLines(inputFile);
		const matched1 = input[0].match(/Player 1 starting position: ([\d]+)/);
		const matched2 = input[1].match(/Player 2 starting position: ([\d]+)/);

		if (!matched1 || !matched2) {
			throw 'unexpected input';
		}

		this.player1Position = parseInt(matched1[1]) - 1;
		this.player2Position = parseInt(matched2[1]) - 1;
	}

	protected solvePart1(): string {
		this.sampleLog('player1Position', this.player1Position);
		this.sampleLog('player2Position', this.player2Position);

		const board = new CircularArray<number>();
		for (let i = 1; i <= 10; i++) {
			board.insert(i, i-1);
		}

		this.sampleLog('board', board);

		let numRolls = 0;
		let player1Score = 0;
		let player2Score = 0;

		for (;;) {
			let player1Move = 0;

			player1Move += numRolls + 1;
			numRolls++;
			player1Move += numRolls + 1;
			numRolls++;
			player1Move += numRolls + 1;
			numRolls++;

			this.player1Position += player1Move;
			const player1Land = board.safeGet(this.player1Position);
			player1Score += player1Land;
			this.sampleLog(`Player 1 moved ${player1Move}, landed on ${player1Land}, and score is now ${player1Score}`);

			if (player1Score >= 1000) {
				return `${numRolls * player2Score}`;
			}

			let player2Move = 0;

			player2Move += numRolls + 1;
			numRolls++;
			player2Move += numRolls + 1;
			numRolls++;
			player2Move += numRolls + 1;
			numRolls++;

			this.player2Position += player2Move;
			const player2Land = board.safeGet(this.player2Position);
			player2Score += player2Land;
			this.sampleLog(`Player 2 moved ${player2Move}, landed on ${player2Land}, and score is now ${player2Score}`);

			if (player2Score >= 1000) {
				return `${numRolls * player1Score}`;
			}
		}
	}

	protected solvePart2(): string {
		// Map of dice roll to number of combinations that could have resulted in that roll
		const possibleRolls = [3, 4, 5, 6, 7, 8, 9];
		const rollCombos: { [roll: number]: number} = {
			3: 1,
			4: 3,
			5: 6,
			6: 7,
			7: 6,
			8: 3,
			9: 1,
		};

		let player1Universes = 0;
		let player2Universes = 0;

		// Map of game states (as string) to number of universes that lead to that game state
		let gameStates: Map<string, number> = new Map();
		const startingState = `${this.player1Position + 1}_0_${this.player2Position + 1}_0`;
		gameStates.set(startingState, 1);
		let curPlayer = 1;

		this.initProgress(20);

		let numRolls = 0;

		while (gameStates.size > 0) {
			// make new map of game states to hold remaining states after the next roll
			const newGameStates: Map<string, number> = new Map();

			// go through each game state
			gameStates.forEach((numUniverses, gameStateStr) => {
				const gameState = GameState.fromString(gameStateStr);
				// go through each possible next roll
				for (const roll of possibleRolls) {
					if (numRolls < 3 || numRolls > 17) {
						this.sampleLog(`Rolling a ${roll} with starting state ${gameState.toString()} in ${numUniverses} universes`);
					}
					const newState = gameState.roll(curPlayer, roll);

					// calculate the new number of universes that lead to this game state
					const rollUniverses = numUniverses * rollCombos[roll];

					// if the game has ended, increment the number of universes in which the player won
					const winner = newState.winner();
					if (winner === 1) {
						player1Universes += rollUniverses;
						if (numRolls < 3 || numRolls > 16) {
							this.sampleLog(`Player 1 won in ${rollUniverses} universes, ending with state ${newState.toString()}`);
						}
					} else if (winner === 2) {
						player2Universes += rollUniverses;
						if (numRolls < 3 || numRolls > 16) {
							this.sampleLog(`Player 2 won in ${rollUniverses} universes, ending with state ${newState.toString()}`);
						}
					} else {
						// if not, add the updated game state to new set of game states
						const newStateStr = newState.toString();
						const existing = newGameStates.get(newStateStr);
						if (existing) {
							newGameStates.set(newStateStr, existing + rollUniverses);
						} else {
							newGameStates.set(newStateStr, rollUniverses);
						}
						if (numRolls < 3 || numRolls > 16) {
							this.sampleLog(`No-one won in ${rollUniverses} universes, ending with state ${newState.toString()}`);
						}
					}
				}
			});

			curPlayer = (curPlayer === 1) ? 2 : 1;
			gameStates = newGameStates;

			numRolls++;
			this.sampleLog(`After ${numRolls} rolls, we have ${gameStates.size} game states`);

			this.incrementProgress();
		}

		this.stopProgress();

		const winningUniverses = Math.max(player1Universes, player2Universes);

		return `${winningUniverses}`;
	}
}

new Day21Solver().solveForArgs();
