import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import CircularArray from '../../common/CircularArray';
import CircularLinkedList from '../../common/CircularLinkedList';

class Day9Solver extends Solver {
	private input = '';

	public init(inputFile: string): void {
		this.input = InputParser.readString(inputFile);
	}

	protected solvePart1(): string {
		const match = /(\d+) players; last marble is worth (\d+) points/.exec(this.input) || [];
		const numPlayers = parseInt(match[1]);
		const lastMarble = parseInt(match[2]);

		// const scores = this.playGame(numPlayers, lastMarble);
		// const winningScore = Math.max(...scores);
		// const winningPlayer = scores.indexOf(winningScore);

		const scores = this.playGameLinkedList(numPlayers, lastMarble);
		let winningPlayer = -1;
		let winningScore = -1;
		scores.forEach((score, player) => {
			if (score > winningScore) {
				winningScore = score;
				winningPlayer = player;
			}
		});

		this.sampleLog(`Winning player is ${winningPlayer + 1} with score ${winningScore}`);

		return `${winningScore}`;
	}

	protected solvePart2(): string {
		const match = /(\d+) players; last marble is worth (\d+) points/.exec(this.input) || [];
		const numPlayers = parseInt(match[1]);
		const lastMarble = parseInt(match[2]);

		const scores = this.playGameLinkedList(numPlayers, lastMarble * 100);
		let winningPlayer = -1;
		let winningScore = -1;
		scores.forEach((score, player) => {
			if (score > winningScore) {
				winningScore = score;
				winningPlayer = player;
			}
		});

		this.sampleLog(`Winning player is ${winningPlayer + 1} with score ${winningScore}`);

		return `${winningScore}`;
	}

	private playGame(numPlayers: number, lastMarble: number): Array<number> {
		const playerScores = Array.from({ length: numPlayers }, () => 0);

		const board = new CircularArray<number>();
		board.insert(0, 0);
		let curMarbleIndex = 0;
		let nextMarble = 1;
		let curPlayerIndex = 0;

		this.sampleLog(`Initial state - [${curPlayerIndex + 1}] (${curMarbleIndex} -> ${board.get(curMarbleIndex)}) ${board.array}`);

		this.initProgress(lastMarble);

		while (nextMarble <= lastMarble) {
			if (nextMarble % 23 !== 0) {
				const insertIndex = board.shiftIndex(curMarbleIndex, 1);
				this.sampleLog(`Placing marble ${nextMarble} clockwise of index ${insertIndex}`);
				board.insert(nextMarble, insertIndex + 1);
				curMarbleIndex = board.shiftIndex(insertIndex, 1);
				this.sampleLog(`Current marble changed to ${curMarbleIndex}`);
			} else {
				this.sampleLog(`Marble ${nextMarble} is multiple of 23, adding to score of player ${curPlayerIndex}`);
				playerScores[curPlayerIndex] += nextMarble;
				curMarbleIndex = board.shiftIndex(curMarbleIndex, -7);
				const removedMarble = board.remove(curMarbleIndex);
				playerScores[curPlayerIndex] += removedMarble;
				this.sampleLog(`Removed marble ${removedMarble} at index ${curMarbleIndex} and also added to score`);
			}

			this.sampleLog(`[${curPlayerIndex + 1}] (${curMarbleIndex} -> ${board.get(curMarbleIndex)}) ${board.array}`);

			curPlayerIndex++;
			nextMarble++;

			if (curPlayerIndex >= numPlayers) {
				curPlayerIndex = 0;
			}

			this.incrementProgress();
		}

		this.stopProgress();

		return playerScores;
	}

	private playGameLinkedList(numPlayers: number, lastMarble: number): Map<number, number> {
		const playerScores = new Map();
		for (let p = 0; p < numPlayers; p++) {
			playerScores.set(p, 0);
		}

		const board = new CircularLinkedList<number>(0);
		let nextMarble = 1;
		let curPlayerIndex = 0;

		this.sampleLog(`Initial state - [${curPlayerIndex + 1}] (${board.getCurrent()}) ${board.toString()}`);

		this.initProgress(lastMarble);

		while (nextMarble <= lastMarble) {
			if (nextMarble % 23 !== 0) {
				board.shiftCurrent(1);
				this.sampleLog(`Placing marble ${nextMarble} clockwise of marble ${board.getCurrent()}`);
				board.insertClockwise(nextMarble);
				board.shiftCurrent(1);
				this.sampleLog(`Current marble changed to ${board.getCurrent()}`);
			} else {
				board.shiftCurrent(-7);
				const removedMarble = board.remove();
				playerScores.set(curPlayerIndex, playerScores.get(curPlayerIndex) + nextMarble + removedMarble);
				this.sampleLog(`Marble ${nextMarble} is multiple of 23, adding to score of player ${curPlayerIndex} along with removed marble ${removedMarble}`);
			}

			this.sampleLog(`[${curPlayerIndex + 1}] (${board.getCurrent()}) ${board.toString()}`);

			curPlayerIndex++;
			nextMarble++;

			if (curPlayerIndex >= numPlayers) {
				curPlayerIndex = 0;
			}

			this.incrementProgress();
		}

		this.stopProgress();

		return playerScores;
	}
}

new Day9Solver().solveForArgs();
