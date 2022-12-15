import { Solver } from '../../common/Solver';

const verboseMode = false;

interface Operation {
	type: '+' | '*' | '^';
	num: number;
}

interface Monkey {
	num: number;
	items: Array<number>;
	itemsP2: Array<Array<Operation>>;
	operationAdd: number,
	operationMultiply: number,
	operationSquare: boolean,
	testDivisor: number;
	throwIfTrue: number;
	throwIfFalse: number;
	timesInspected: number;
}

class Day11Solver extends Solver {
	private monkeys: Array<Monkey> = [];

	public init(): void {
		// Parsing takes longer than typing
		if (process.env.SAMPLE_FILE) {
			this.makeMonkey([79, 98], 0, 19, false, 23, 2, 3);
			this.makeMonkey([54, 65, 75, 74], 6, 0, false, 19, 2, 0);
			this.makeMonkey([79, 60, 97], 0, 0, true, 13, 1, 3);
			this.makeMonkey([74], 3, 0, false, 17, 0, 1);
		} else {
			this.makeMonkey([98, 97, 98, 55, 56, 72], 0, 13, false, 11, 4, 7);
			this.makeMonkey([73, 99, 55, 54, 88, 50, 55], 4, 0, false, 17, 2, 6);
			this.makeMonkey([67, 98], 0, 11, false, 5, 6, 5);
			this.makeMonkey([82, 91, 92, 53, 99], 8, 0, false, 13, 1, 2);
			this.makeMonkey([52, 62, 94, 96, 52, 87, 53, 60], 0, 0, true, 19, 3, 1);
			this.makeMonkey([94, 80, 84, 79], 5, 0, false, 2, 7, 0);
			this.makeMonkey([89], 1, 0, false, 3, 0, 5);
			this.makeMonkey([70, 59, 63], 3, 0, false, 7, 4, 3);
		}
	}

	protected solvePart1(): string {
		return `${this.solve(false)}`;
	}

	protected solvePart2(): string {
		return `${this.solve(true)}`;
	}

	protected solve(part2: boolean): string {
		const numRounds = part2 ? 10000 : 20;
		this.initProgress(numRounds);
		for (let round = 0; round < numRounds; round++) {
			if (!part2) {
				this.sampleLog(`\nROUND ${round + 1}\n`);
			}
			this.monkeys.forEach(m => {
				verboseMode && this.sampleLog(`Monkey ${m.num}`);
				if (!part2) {
					while (m.items.length > 0) {
						this.inspect(m);
					}
				} else {
					while (m.itemsP2.length > 0) {
						this.inspectP2(m);
					}
				}
			});
			if (!part2) {
				this.sampleLog(`\nWorry levels after round ${round + 1}\n`);
				this.monkeys.forEach(m => this.sampleLog(`Monkey ${m.num}: ${m.items.join(', ')}`));
			}
			if (part2 && [0, 19, 999, 1999, 2999, 3999, 4999, 5999, 6999, 7999, 8999, 9999].findIndex(n => n === round) > -1) {
				this.sampleLog(`\nInspections after round ${round + 1}\n`);
				this.monkeys.forEach(m => this.sampleLog(`Monkey ${m.num}: ${m.timesInspected}`));
			}

			this.incrementProgress();
		}
		this.stopProgress();

		this.monkeys.sort((m1, m2) => m2.timesInspected - m1.timesInspected);
		this.sampleLog(`top 2 inspections: ${this.monkeys[0].num}=${this.monkeys[0].timesInspected}, ${this.monkeys[1].num}=${this.monkeys[1].timesInspected}`);

		return `${this.monkeys[0].timesInspected * this.monkeys[1].timesInspected}`;
	}

	private makeMonkey(
		items: Array<number>, 
		operationAdd: number,
		operationMultiply: number,
		operationSquare: boolean,
		testDivisor: number, 
		throwIfTrue: number,
		throwIfFalse: number
	) {
		if ((operationAdd > 0 ? 1 : 0) + (operationMultiply > 0 ? 1 : 0) + (operationSquare ? 1 : 0) !== 1) {
			throw 'unexpected operation';
		}
		this.monkeys.push({
			num: this.monkeys.length,
			items,
			itemsP2: items.map(n => [{ type: '+', num: n }]),
			operationAdd,
			operationMultiply,
			operationSquare,
			testDivisor,
			throwIfTrue,
			throwIfFalse,
			timesInspected: 0,
		});
	}

	private newWorryLevel(monkey: Monkey, item: number): number {
		if (monkey.operationAdd) {
			return item + monkey.operationAdd;
		}
		if (monkey.operationMultiply) {
			return item * monkey.operationMultiply;
		}
		if (monkey.operationSquare) {
			return item * item;
		}
		throw 'unexpected operation';
	}

	private inspect(monkey: Monkey) {
		const item = monkey.items.shift();
		if (!item) {
			throw 'unexpected items';
		}

		verboseMode && this.sampleLog(`  Monkey inspects an item with a worry level of ${item}.`);
		monkey.timesInspected++;

		let newItem = this.newWorryLevel(monkey, item);
		verboseMode && this.sampleLog(`    Worry level is updated to ${newItem}.`);

		newItem = Math.floor(newItem / 3);
		verboseMode && this.sampleLog(`    Monkey gets bored with item. Worry level is divided by 3 to ${newItem}.`);
		
		const test = newItem % monkey.testDivisor === 0;
		verboseMode && this.sampleLog(`    Current worry level ${test ? 'is' : 'is not'} divisible by ${monkey.testDivisor}.`);
		
		const target = test ? monkey.throwIfTrue : monkey.throwIfFalse;
		verboseMode && this.sampleLog(`    Item with worry level ${newItem} is thrown to monkey ${target}.`);
		this.monkeys[target].items.push(newItem);
	}

	private monkeyOperation(monkey: Monkey): Operation {
		if (monkey.operationAdd) {
			return { type: '+', num: monkey.operationAdd };
		}
		if (monkey.operationMultiply) {
			return { type: '*', num: monkey.operationMultiply };
		}
		if (monkey.operationSquare) {
			return { type: '^', num: 2 };
		}
		throw 'unexpected operation';
	}

	private resolve(monkey: Monkey, item: Array<Operation>): number {
		// Instead of resolving the entire operation, take modulus as each operation is applied.
		// This results in the same modulus at the end.

		let result = 0;
		for (const op of item) {
			switch (op.type) {
			case '+':
				result += op.num;
				break;
			case '*':
				result *= op.num;
				break;
			case '^': {
				result **= op.num;
				break;
			}
			}

			result = result % monkey.testDivisor;
		}

		return result;
	}

	private inspectP2(monkey: Monkey) {
		const item = monkey.itemsP2.shift();
		if (!item) {
			throw 'unexpected items';
		}

		verboseMode && this.sampleLog(`  Monkey inspects an item with a worry sequence of ${item.map(o => `${o.type}${o.num}`).join(' ')}.`);
		monkey.timesInspected++;

		const operation = this.monkeyOperation(monkey);
		item.push(operation);
		verboseMode && this.sampleLog(`    Operation ${operation.type} ${operation.num} is added to item`);
		
		const result = this.resolve(monkey, item);
		const test = result % monkey.testDivisor === 0;
		verboseMode && this.sampleLog(`    Current worry level ${result} ${test ? 'is' : 'is not'} divisible by ${monkey.testDivisor}.`);

		const target = test ? monkey.throwIfTrue : monkey.throwIfFalse;
		verboseMode && this.sampleLog(`    Item is thrown to monkey ${target}.`);
		this.monkeys[target].itemsP2.push(item);
	}
}

new Day11Solver().solveForArgs();