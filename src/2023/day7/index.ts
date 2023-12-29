import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

const cardMap: {[card: string]: number} = {
	'A': 0,
	'K': 1,
	'Q': 2,
	'J': 3,
	'T': 4,
	'9': 5,
	'8': 6,
	'7': 7,
	'6': 8,
	'5': 9,
	'4': 10,
	'3': 11,
	'2': 12,
};

const cardMapP2: {[card: string]: number} = {
	'A': 0,
	'K': 1,
	'Q': 2,
	'T': 3,
	'9': 4,
	'8': 5,
	'7': 6,
	'6': 7,
	'5': 8,
	'4': 9,
	'3': 10,
	'2': 11,
	'J': 12,
};

export class Hand {
	public cards: Array<string>;
	public cardCounts: Array<number>;
	public bid: number;
	public type: number;
	public jokerType: number;
	
	constructor(line: string) {
		const split = line.split(' ');
		this.cards = split[0].split('');
		this.bid = parseInt(split[1]);

		this.cardCounts = new Array(13).fill(0);

		this.cards.forEach(card => {
			this.cardCounts[cardMap[card]]++;
		});

		this.type = this.getType();
		this.jokerType = this.getJokerType();
	}

	public toString(): string {
		return `${this.cards.join('')} ${this.bid}`;
	}

	public compareTo(other: Hand, part2: boolean): number {
		if (part2) {
			if (this.jokerType != other.jokerType) {
				return this.jokerType - other.jokerType;
			}
		} else {
			if (this.type != other.type) {
				return this.type - other.type;
			}
		}

		for (let i = 0; i < this.cards.length; i++) {
			const thisStrength = part2 ? cardMapP2[this.cards[i]] : cardMap[this.cards[i]];
			const otherStrength = part2 ? cardMapP2[other.cards[i]] : cardMap[other.cards[i]];
			if (thisStrength != otherStrength) {
				return thisStrength - otherStrength;
			}
		}

		return 0;
	}

	private getType(): number {
		let has5 = false, has4 = false, has3 = false, twoCount = 0;
		for (const count of this.cardCounts) {
			if (count === 5) {
				has5 = true;
			} else if (count === 4) {
				has4 = true;
			} else if (count === 3) {
				has3 = true;
			} else if (count === 2) {
				twoCount++;
			}
		}

		// 0 - five of a kind
		if (has5) {
			return 0;
		}
		
		// 1 - four of a kind
		if (has4) {
			return 1;
		}
		
		// 2 - full house
		if (has3 && twoCount === 1) {
			return 2;
		}
		
		// 3 - three of a kind
		if (has3) {
			return 3;
		}
		
		// 4 - two pair
		if (twoCount == 2) {
			return 4;
		}
		
		// 5 - one pair
		if (twoCount == 1) {
			return 5;
		}

		// 6 - high card
		return 6;
	}
	

	private getJokerType(): number {
		let has5 = false, has4 = false, has3 = false, twoCount = 0;
		const nonJokerCards = new Set();
		const jokerIndex = cardMap['J'];
		const jokerCount = this.cardCounts[jokerIndex];
		for (let i = 0; i < this.cardCounts.length; i++) {
			if (i === jokerIndex) {
				continue;
			}
			const count = this.cardCounts[i];
			if (count === 5) {
				has5 = true;
			} else if (count === 4) {
				has4 = true;
			} else if (count === 3) {
				has3 = true;
			} else if (count === 2) {
				twoCount++;
			}
			
			if (count > 0) {
				nonJokerCards.add(i);
			}
		}

		// 0 - five of a kind
		if (has5 || (has4 && jokerCount >= 1) || (has3 && jokerCount >= 2) 
			|| (twoCount > 0 && jokerCount >= 3) || jokerCount >= 4) {
			return 0;
		}
		
		// 1 - four of a kind
		if (has4 || (has3 && jokerCount >= 1) || (twoCount > 0 && jokerCount >= 2) 
			|| jokerCount >= 3) {
			return 1;
		}
		
		// 2 - full house
		if (has3 && twoCount >= 1) {
			return 2;
		}
		// otherwise check if the cards are entirely made up of jokers and one or two other cards
		else if (jokerCount > 0 && nonJokerCards.size <= 2) {
			return 2;
		}
		
		// 3 - three of a kind
		if (has3 || (twoCount > 0 && jokerCount >= 1) || jokerCount >= 2) {
			return 3;
		}
		
		// 4 - two pair
		if (twoCount >= 2 || twoCount === 1 && jokerCount >= 1 || jokerCount >= 2) {
			return 4;
		}
		
		// 5 - one pair
		if (twoCount >= 1 || jokerCount >= 1) {
			return 5;
		}

		// 6 - high card
		return 6;
	}
}

class Day7Solver extends Solver {
	private hands: Array<Hand> = [];

	public init(inputFile: string): void {
		this.hands = InputParser.readLinesWithTransform(inputFile, (line) => new Hand(line));
	}

	protected solvePart1(): string {
		this.sampleLog('Unsorted hands');
		this.sampleLog(this.hands.map(h => h.toString()).join('\n'));

		this.hands.sort((a, b) => a.compareTo(b, false));
		
		this.sampleLog('Sorted hands');
		this.sampleLog(this.hands.map(h => h.toString()).join('\n'));

		let result = 0, curRank = 1;
		for (const hand of this.hands.reverse()) {
			result += hand.bid * curRank++;
		}
		return `${result}`;
	}

	protected solvePart2(): string {
		this.sampleLog('Unsorted hands');
		this.sampleLog(this.hands.map(h => h.toString()).join('\n'));

		this.hands.sort((a, b) => a.compareTo(b, true));
		
		this.sampleLog('Sorted hands');
		this.sampleLog(this.hands.map(h => h.toString()).join('\n'));

		let result = 0, curRank = 1;
		for (const hand of this.hands.reverse()) {
			result += hand.bid * curRank++;
		}
		return `${result}`;
	}
}

new Day7Solver().solveForArgs();