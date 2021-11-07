import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import CircularArrayList from "../../common/CircularArrayList";

class Day9Solver extends Solver {
	private input: Array<any> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {

		const scores = this.playGame(9, 25);
		const winningScore = Math.max(...scores);
		const winningPlayer = scores.indexOf(winningScore);

		this.sampleLog(`Winning player is ${winningPlayer + 1} with score ${winningScore}`);

		return `${winningScore}`;
	}

	protected solvePart2(): string {
		return 'todo';
	}

	private playGame(numPlayers: number, lastMarble: number): Array<number> {
		const playerScores = Array.from({ length: numPlayers }, () => 0);

		const board = new CircularArrayList<number>();
		board.insert(0, 0);
		let curMarbleIndex = 0;
		let nextMarble = 1;
		let curPlayerIndex = 0;

		while (nextMarble <= lastMarble) {
			if (nextMarble % 23 !== 0) {
				board.insert(nextMarble, curMarbleIndex + 1);
				curMarbleIndex = board.shiftIndex(curMarbleIndex, 2);
			} else {
				playerScores[curPlayerIndex] += nextMarble;
				curMarbleIndex = board.shiftIndex(curMarbleIndex, -7);
				playerScores[curPlayerIndex] += board.remove(curMarbleIndex);
			}

			this.sampleLog(`[${curPlayerIndex + 1}] (${board.get(curMarbleIndex)}) ${board.array}`);

			curPlayerIndex++;
			nextMarble++;

			if (curPlayerIndex >= numPlayers) {
				curPlayerIndex = 0;
			}
		}

		return playerScores;
	}
}

new Day9Solver().solveForArgs();
