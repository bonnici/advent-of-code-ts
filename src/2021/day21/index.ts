import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import CircularArray from '../../common/CircularArray';

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
		return `${'todo'}`;
	}
}

new Day21Solver().solveForArgs();
