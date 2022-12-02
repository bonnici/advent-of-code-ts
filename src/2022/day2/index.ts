import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

enum Hands {
	ROCK,
	PAPER,
	SCISSORS,
}
enum Strat {
	WIN,
	LOSE,
	DRAW,
}

const theirHands: {[x: string]: Hands} = {
	'A': Hands.ROCK,
	'B': Hands.PAPER,
	'C': Hands.SCISSORS
};
const myHands: {[x: string]: Hands} = {
	'X': Hands.ROCK,
	'Y': Hands.PAPER,
	'Z': Hands.SCISSORS
};
const strategies: {[x: string]: Strat} = {
	'X': Strat.LOSE,
	'Y': Strat.DRAW,
	'Z': Strat.WIN
};

class Day2Solver extends Solver {
	private input: Array<Array<string>> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesAsChars(inputFile);
	}

	private handScore(hand: Hands): number {
		switch (hand) {
		case Hands.ROCK:
			return 1;
		case Hands.PAPER:
			return 2;
		case Hands.SCISSORS:
			return 3;
		default:
			return 0;
		}
	}
	
	private winScore(them: Hands, me: Hands): number {
		this.sampleLog(`them: ${them}, me: ${me}`);

		if (me === them) {
			return 3;
		}
		
		if (
			(me === Hands.ROCK && them === Hands.SCISSORS) || 
			(me === Hands.PAPER && them === Hands.ROCK) || 
			(me === Hands.SCISSORS && them === Hands.PAPER)
		) {
			return 6;
		}

		return 0;
	}
	
	private handScoreToWin(hand: Hands): number {
		switch (hand) {
		case Hands.ROCK:
			return this.handScore(Hands.PAPER);
		case Hands.PAPER:
			return this.handScore(Hands.SCISSORS);
		case Hands.SCISSORS:
			return this.handScore(Hands.ROCK);
		default:
			return 0;
		}
	}

	private handScoreToLose(hand: Hands): number {
		switch (hand) {
		case Hands.ROCK:
			return this.handScore(Hands.SCISSORS);
		case Hands.PAPER:
			return this.handScore(Hands.ROCK);
		case Hands.SCISSORS:
			return this.handScore(Hands.PAPER);
		default:
			return 0;
		}
	}

	protected solvePart1(): string {
		this.sampleLog(this.input);

		let score = 0;
		this.input.forEach(line => {
			const myHand = myHands[line[2]];
			const theirHand = theirHands[line[0]];
			score += this.handScore(myHand) + this.winScore(theirHand, myHand);
		});

		return `${score}`;
	}

	protected solvePart2(): string {
		let score = 0;
		this.input.forEach(line => {
			const strategy = line[2];
			const theirHand = theirHands[line[0]];

			switch (strategies[strategy]) {
			case Strat.WIN:
				score += 6 + this.handScoreToWin(theirHand);
				break;
			case Strat.LOSE:
				score += 0 + this.handScoreToLose(theirHand);
				break;
			case Strat.DRAW:
				score += 3 + this.handScore(theirHand);
				break;
			}
		});

		return `${score}`;
	}
}

new Day2Solver().solveForArgs();