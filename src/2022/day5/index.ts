import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Move {
	count: number;
	from: number;
	to: number;
}

class Day5Solver extends Solver {
	private stacks: Array<Array<string>> = [];
	private moves: Array<Move> = [];

	public init(inputFile: string): void {
		const groups = InputParser.readLinesInGroups(inputFile, false);

		let numStacks = 3;
		let stackStartRow = 2;
		if (!process.env.SAMPLE_FILE) {
			numStacks = 9;
			stackStartRow = 7;
		}

		for (let stack = 0; stack < numStacks; stack++) {
			const crates = [];
			for (let row = stackStartRow; row >= 0; row--) {
				const crate = groups[0][row].charAt((stack * 4) + 1);
				if (crate != ' ') {
					crates.push(crate);
				} else {
					break;
				}
			}
			this.sampleLog(`crate: ${crates}`);
			this.stacks.push(crates);
		}

		groups[1].forEach(line => {
			const words = line.split(' ');
			this.moves.push({ 
				count: parseInt(words[1]),
				from: parseInt(words[3]),
				to: parseInt(words[5]),
			});
		});

		this.sampleLog('moves');
		this.moves.forEach(move => this.sampleLog(`move ${move.count} from ${move.from} to ${move.to}`));
	}

	private solve(shouldReverse: boolean): string {
		this.sampleLog(`crates: \n${this.stacks.map(stack => stack.join()).join('\n')}`);

		this.moves.forEach(move => {
			const fromCrate = this.stacks[move.from - 1];
			const toCrate = this.stacks[move.to - 1];
			const toMove = fromCrate.splice(fromCrate.length - move.count, move.count);
			const toMoveInOrder = shouldReverse ? toMove.reverse().join() : toMove.join();
			this.sampleLog(`toMove: ${toMove}, toMoveInOrder ${toMoveInOrder}`);
			toCrate.push(...toMove);
			
			this.sampleLog(`after move ${move.count} from ${move.from} to ${move.to}`);
			this.sampleLog(`crates: \n${this.stacks.map(stack => stack.join()).join('\n')}`);

		});

		const topCrates = this.stacks.map(stack => stack.length > 0 ? stack[stack.length - 1] : ' ');
		this.sampleLog(`topCrates ${topCrates}`);

		return `${topCrates.join('')}`;
	}

	protected solvePart1(): string {
		return `${this.solve(true)}`;
	}

	protected solvePart2(): string {
		return `${this.solve(false)}`;
	}
}

new Day5Solver().solveForArgs();