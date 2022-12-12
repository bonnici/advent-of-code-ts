import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Day10Solver extends Solver {
	private input: Array<string> = [];
	private registerX = 1;
	private clockCycle = 1;
	private result = 0;
	private crtPos = 0;
	private pixels: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	private incrementCycle() {
		if (this.crtPos >= this.registerX - 1 && this.crtPos <= this.registerX + 1) {
			this.pixels.push('█');
		} else {
			this.pixels.push(' ');
		}

		for (const target of [20, 60, 100, 140, 180, 220]) {
			if (this.clockCycle === target) {
				this.sampleLog(`Found target ${target} with registerX=${this.registerX}`);
				this.result += (target * this.registerX);
			}
		}
		this.clockCycle++;
		this.crtPos++;
		if (this.crtPos >= 40) {
			this.pixels.push('\n');
			this.crtPos = 0;
		}
	}

	protected solve(): string {
		for (const line of this.input) {
			this.sampleLog(`Processing line [${line}] with registerX=${this.registerX} and clockCycle=${this.clockCycle}`);

			const split = line.split(' ');
			switch (split[0]) {
			case 'noop':
				this.incrementCycle();
				break;
			case 'addx': {
				this.incrementCycle();
				this.incrementCycle();
				this.registerX = this.registerX + parseInt(split[1]);
				break;
			}
			}
		}

		return `${this.result}`;
	}

	protected solvePart1(): string {
		this.solve();
		return `${this.result}`;
	}

	protected solvePart2(): string {
		this.solve();
		return `\n${this.pixels.join('')}`;
	}
}

new Day10Solver().solveForArgs();