import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class PacketValue {
	protected constructor(private logFn: (str: string) => void, private val: number | Array<PacketValue>) {
	}

	public static fromJson(logFn: (str: string) => void, val: unknown): PacketValue {
		if (typeof val === 'number') {
			return new PacketValue(logFn, val);
		} else if (Array.isArray(val)) {
			const list = val.map(v => PacketValue.fromJson(logFn, v));
			return new PacketValue(logFn, list);
		} else {
			throw 'unexpected JSON';
		}
	}
	
	public static fromList(logFn: (str: string) => void, list: Array<PacketValue>): PacketValue {
		return new PacketValue(logFn, list);
	}

	public isInt(): boolean {
		return typeof this.val === 'number';
	}

	public get valAsInt(): number {
		return this.val as number;
	}

	public get valAsList(): Array<PacketValue> {
		return this.val as Array<PacketValue>;
	}

	// -1 if this is smaller, 0 if they are the same, 1 if this is larget
	public compare(other: PacketValue, depth: number): number {
		const tab = Array(depth + 1).join(' ');
		this.logFn(`${tab}- Compare ${this.toString()} vs ${other.toString()}`);
		if (this.isInt() && other.isInt()) {
			// both ints - normal comparison
			const result = this.valAsInt < other.valAsInt ? -1 : (this.valAsInt > other.valAsInt ? 1 : 0);
			if (result === -1) {
				this.logFn(`${tab} - Left side is smaller, so inputs are in the right order`);
			} else if (result === 1) {
				this.logFn(`${tab} - Right side is smaller, so inputs are NOT in the right order`);
			}
			return result;
		} else if (!this.isInt() && !other.isInt()) {
			// both lists - compare values in order
			for (let i = 0; i < Math.min(this.valAsList.length, other.valAsList.length); i++) {
				const thisElem = this.valAsList[i];
				const otherElem = other.valAsList[i];
				const comparison = thisElem.compare(otherElem, depth + 1);
				
				if (comparison !== 0) {
					return comparison;
				}
				// otherwise continue
			}

			// this running out of elements means this is smaller, other running out means other is smaller
			if (this.valAsList.length < other.valAsList.length) {
				this.logFn(`${tab} - Left side ran out of items, so inputs are in the right order`);
				return -1;
			} else if (this.valAsList.length > other.valAsList.length) {
				this.logFn(`${tab} - Right side ran out of items, so inputs are NOT in the right order`);
				return 1;
			} else {
				return 0;
			}
		} else {
			// one int and one list - convert int to a list of ints with same length as other list and compare
			if (this.isInt()) {
				const newThis = new PacketValue(this.logFn, [new PacketValue(this.logFn, this.val)]);
				this.logFn(`${tab} - Mixed types; convert left to ${newThis.toString()} and retry comparison`);
				return newThis.compare(other, depth + 1);
			} else {
				const newOther = new PacketValue(this.logFn, [new PacketValue(other.logFn, other.val)]);
				this.logFn(`${tab} - Mixed types; convert right to ${newOther.toString()} and retry comparison`);
				return this.compare(newOther, depth + 1);
			}
		}
	}
	
	public toString(): string {
		if (this.isInt()) {
			return `${this.valAsInt}`;
		} else {
			return `[${this.valAsList.map(v => v.toString()).join(',')}]`;
		}
	}
}

class Packet {
	constructor(private logFn: (str: string) => void, public list: Array<PacketValue>) {}

	public static fromString(logFn: (str: string) => void, str: string): Packet {
		const list = JSON.parse(str);
		return new Packet(logFn, list.map((v: number | Array<unknown>) => PacketValue.fromJson(logFn, v)));
	}

	public toString(): string {
		return `[${this.list.map(v => v.toString()).join(',')}]`;
	}
}

class Pair {
	constructor(private logFn: (str: string) => void, public first: Packet, public second: Packet) {}

	public isInOrder(index: number): boolean {
		this.logFn(`\n== Pair ${index + 1} ==`);

		const leftPacketVal = PacketValue.fromList(this.logFn, this.first.list);
		const rightPacketVal = PacketValue.fromList(this.logFn, this.second.list);

		return leftPacketVal.compare(rightPacketVal, 0) === -1;
	}
	
	public toString(): string {
		return `${this.first.toString()}\n${this.second.toString()}\n`;
	}
}

class Day13Solver extends Solver {
	private pairs: Array<Pair> = [];

	public init(inputFile: string): void {
		const groups = InputParser.readLinesInGroups(inputFile);
		this.sampleLog(groups);

		groups.filter(g => g.length > 0).forEach(g => {
			if (g.length !== 2) {
				throw `Unexpected group [${g}]`;
			}
			const pair = new Pair(
				this.sampleLog, 
				Packet.fromString(this.sampleLog, g[0]), 
				Packet.fromString(this.sampleLog, g[1])
			);
			this.pairs.push(pair);
		});
		
		this.pairs.forEach(p => this.sampleLog(p.toString()));
	}

	protected solvePart1(): string {
		let result = 0;
		this.pairs.forEach((p, i) => {
			if (p.isInOrder(i)) {
				result += i + 1;
				this.sampleLog(`Pair ${i + 1} was in the right order, new result is ${result}`);
			}
		});
		return `${result}`;
	}

	protected solvePart2(): string {
		const allPacketsVals: Array<PacketValue> = [];
		this.pairs.forEach(p => {
			allPacketsVals.push(PacketValue.fromList(this.sampleLog, p.first.list));
			allPacketsVals.push(PacketValue.fromList(this.sampleLog, p.second.list));
		});
		allPacketsVals.push(PacketValue.fromJson(this.sampleLog, JSON.parse('[[2]]')));
		allPacketsVals.push(PacketValue.fromJson(this.sampleLog, JSON.parse('[[6]]')));

		this.sampleLog('\nUnordered packets');
		this.sampleLog(allPacketsVals.map(p => p.toString()).join('\n'));

		allPacketsVals.sort((a,b) => a.compare(b, 0));

		this.sampleLog('\nOrdered packets');
		this.sampleLog(allPacketsVals.map(p => p.toString()).join('\n'));

		const firstDividerIndex = allPacketsVals.findIndex(p => p.toString() === '[[2]]');
		const secondDividerIndex = allPacketsVals.findIndex(p => p.toString() === '[[6]]');

		return `${(firstDividerIndex + 1) * (secondDividerIndex + 1)}`;
	}
}

new Day13Solver().solveForArgs();