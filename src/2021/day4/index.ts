import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class BingoBoard {
	private markedNumbers: Set<number> = new Set();

	constructor(private board: Array<Array<number>>) {}

	public markNumber(num: number): boolean {
		this.markedNumbers.add(num);
		return this.checkWin();
	}

	public calculateScore(): number {
		let score = 0;

		for (let i = 0; i < this.board.length; i++) {
			const row = this.board[i];
			for (let j = 0; j < row.length; j++) {
				const num = row[j];
				if (!this.markedNumbers.has(num)) {
					score += num;
				}
			}
		}

		return score;
	}

	public checkWin(): boolean {
		if (this.markedNumbers.size < 5) {
			return false;
		}

		for (let curRow = 0; curRow < this.board.length; curRow++) {
			if (this.checkRow(curRow)) {
				return true;
			}
		}

		for (let curCol = 0; curCol < this.board[0].length; curCol++) {
			if (this.checkCol(curCol)) {
				return true;
			}
		}

		return false;
	}

	private checkRow(rowNum: number): boolean {
		const row = this.board[rowNum];
		for (const num of row) {
			if (!this.markedNumbers.has(num)) {
				return false;
			}
		}

		return true;
	}

	private checkCol(colNum: number): boolean {
		for (const row of this.board) {
			if (!this.markedNumbers.has(row[colNum])) {
				return false;
			}
		}

		return true;
	}
}

class Day4Solver extends Solver {
	private boards: Array<BingoBoard> = [];
	private numbers: Array<number> = [];

	public init(inputFile: string): void {
		const input = InputParser.readLinesInGroups(inputFile);

		this.numbers = input[0][0].split(',').map(s => parseInt(s));
		this.sampleLog('Input numbers', this.numbers);

		for (let i = 1; i < input.length; i++) {
			const nums: Array<Array<number>> = input[i].map(line =>
				line.split(/(\s+)/).filter(s => s.trim().length > 0).map(s => parseInt(s)));
			this.boards.push(new BingoBoard(nums));

			this.sampleLog(`Board ${i}`, nums);
		}
	}

	protected solvePart1(): string {
		for (const num of this.numbers) {
			for (const board of this.boards) {
				if (board.markNumber(num)) {
					return `${board.calculateScore() * num}`;
				}
			}
		}

		return 'No winners';
	}

	protected solvePart2(): string {
		const winners: Set<number> = new Set();

		for (const num of this.numbers) {
			for (let i = 0; i < this.boards.length; i++) {
				if (winners.has(i)) {
					continue;
				}

				const board = this.boards[i];
				if (board.markNumber(num)) {
					if (winners.size === this.boards.length - 1) {
						return `${board.calculateScore() * num}`;
					} else {
						winners.add(i);
					}
				}
			}
		}

		return 'Not all winners';
	}
}

new Day4Solver().solveForArgs();