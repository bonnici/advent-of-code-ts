import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

export class ALU {
	private compiledInstructions: Array<() => void> = [];
	private curInstruction = 0;
	private curInputInstruction = 0;
	private curInput = 0;
	private input: Array<number> = [];
	private lastInput: Array<number> | null = null;
	private lastResult: { [name: string ]: number } | null = null;

	private varCache: Array<{ [name: string ]: number }> = [];
	private inputInstructions: Array<number> = [];

	public vars: { [name: string ]: number } = {};

	constructor(
		instructions: Array<string>,
		private logFn: ((...args: unknown[]) => void) | undefined = undefined)
	{

		this.vars = {
			w: 0,
			x: 0,
			y: 0,
			z: 0,
		};
		this.curInstruction = 0;
		this.curInput = 0;
		this.curInputInstruction = 0;

		/*
		for (let i = 0; i < instructions.length; i++) {
			const instruction = instructions[i];

			this.compiledInstructions.push(this.compileInstruction(instruction));

			if (instruction.indexOf('inp ') === 0) {
				this.inputInstructions.push(i);

				// this will get updated on the first run
				this.varCache.push({ w: 0, x: 0, y: 0, z: 0 });
			}
		}
		*/

		// precompile instructions knowing that we've traced through the results
		this.compiledInstructions.push(this.firstGroupForm(this.input[0], 10, 10));
		this.compiledInstructions.push(this.firstGroupForm(this.input[1], 13, 5));
		this.compiledInstructions.push(this.firstGroupForm(this.input[2], 15, 12));
		this.compiledInstructions.push(this.secondGroupForm(this.input[3], -12, 12));
		this.compiledInstructions.push(this.firstGroupForm(this.input[4], 14, 6));
		this.compiledInstructions.push(this.secondGroupForm(this.input[5], -2, 4));
		this.compiledInstructions.push(this.firstGroupForm(this.input[6], 13, 15));
		this.compiledInstructions.push(this.secondGroupForm(this.input[7], -12, 3));
		this.compiledInstructions.push(this.firstGroupForm(this.input[8], 15, 7));
		this.compiledInstructions.push(this.firstGroupForm(this.input[9], 11, 11));
		this.compiledInstructions.push(this.secondGroupForm(this.input[10], -3, 2));
		this.compiledInstructions.push(this.secondGroupForm(this.input[11], -13, 12));
		this.compiledInstructions.push(this.secondGroupForm(this.input[12], -12, 4));
		this.compiledInstructions.push(this.secondGroupForm(this.input[13], -13, 11));
	}

	// Update Z based on previous value of Z and arguments (for when first arg === 1)
	public firstGroupForm(input: number, arg2: number, arg3: number): () => void {
		return () => this.vars['z'] = (input === ((this.vars['z'] % 26) + arg2) ? this.vars['z'] : (this.vars['z'] * 26 + input + arg3));
	}

	// Update Z based on previous value of Z and arguments (for when first arg === 26)
	public secondGroupForm(input: number,arg2: number, arg3: number): () => void {
		return () => this.vars['z'] = (input === ((this.vars['z'] % 26) + arg2) ? Math.floor(this.vars['z'] / 26) : (Math.floor(this.vars['z'] / 26) + input + arg3));
	}

	// Runs all instructions
	public run(input: Array<number>): void {
		this.input = input;

		const sameInputs = this.loadFromCache();
		if (sameInputs) {
			if (this.lastResult === null) {
				throw 'same input as last time but no result';
			}
			this.vars = this.lastResult;
			return;
		}

		do {
			//this.logFn && this.logFn(`Running instruction ${this.curInstruction}: ${this.instructions[this.curInstruction]}`);
			this.logFn && this.logFn(`Running instruction ${this.curInstruction}`);
		} while (this.runInstruction());

		this.lastResult = { ...this.vars };
		this.lastInput = [...input];
	}
	
	public compileInstruction(instruction: string): () => void {
		const split = instruction.split(' ');

		const targetVar = split[1];
		const parsedArg = parseInt(split[2]);
		const arg = isNaN(parsedArg) ? split[2] : parsedArg;
		const argIsNum = typeof arg === 'number';

		switch (split[0]) {
		case 'inp':
			return () => this.inputInstruction(targetVar);
		case 'add':
			if (argIsNum) {
				return () => this.vars[targetVar] += arg;
			} else {
				return () => this.vars[targetVar] += this.vars[arg];
			}
		case 'mul':
			if (argIsNum) {
				return () => this.vars[targetVar] *= arg;
			} else {
				return () => this.vars[targetVar] *= this.vars[arg];
			}
		case 'div':
			if (argIsNum) {
				return () => this.vars[targetVar] = Math.floor(this.vars[targetVar] / arg);
			} else {
				return () => this.vars[targetVar] = Math.floor(this.vars[targetVar] / this.vars[arg]);
			}
		case 'mod':
			if (argIsNum) {
				return () => this.vars[targetVar] %= arg;
			} else {
				return () => this.vars[targetVar] %= this.vars[arg];
			}
		case 'eql':
			if (argIsNum) {
				return () => this.vars[targetVar] = this.vars[targetVar] === arg ? 1 : 0;
			} else {
				return () => this.vars[targetVar] = this.vars[targetVar] === this.vars[arg] ? 1 : 0;
			}
		default:
			throw 'invalid instruction';
		}
	}

	// Runs a single instruction and returns true if there are more instructions
	public runInstruction(): boolean {
		/*
		const instruction = this.instructions[this.curInstruction];
		const split = instruction.split(' ');

		switch (split[0]) {
		case 'inp':
			this.inputInstruction(split[1]);
			break;
		case 'add':
			this.addInstruction(split[1], split[2]);
			break;
		case 'mul':
			this.multiplyInstruction(split[1], split[2]);
			break;
		case 'div':
			this.divideInstruction(split[1], split[2]);
			break;
		case 'mod':
			this.moduloInstruction(split[1], split[2]);
			break;
		case 'eql':
			this.equalsInstruction(split[1], split[2]);
			break;
		default:
			throw 'invalid instruction';
		}
		*/

		const instruction = this.compiledInstructions[this.curInstruction];
		instruction();

		this.curInstruction++;
		return this.curInstruction < this.compiledInstructions.length;
	}

	private inputInstruction(variable: string) {
		if (this.curInput >= this.input.length) {
			throw 'not enough input values';
		}

		this.varCache[this.curInputInstruction] = { ...this.vars };
		this.curInputInstruction++;

		this.vars[variable] = this.input[this.curInput];
		this.curInput++;
	}

	private addInstruction(targetVar: string, arg: string) {
		const existingVar = this.safeGetVal(targetVar);
		const argVal = this.getNumOrVal(arg);

		this.vars[targetVar] = existingVar + argVal;
	}

	private multiplyInstruction(targetVar: string, arg: string) {
		const existingVar = this.safeGetVal(targetVar);
		const argVal = this.getNumOrVal(arg);

		this.vars[targetVar] = existingVar * argVal;
	}

	private divideInstruction(targetVar: string, arg: string) {
		const existingVar = this.safeGetVal(targetVar);
		const argVal = this.getNumOrVal(arg);

		this.vars[targetVar] = Math.floor(existingVar / argVal);
	}

	private moduloInstruction(targetVar: string, arg: string) {
		const existingVar = this.safeGetVal(targetVar);
		const argVal = this.getNumOrVal(arg);

		this.vars[targetVar] = existingVar % argVal;
	}

	private equalsInstruction(targetVar: string, arg: string) {
		const existingVar = this.safeGetVal(targetVar);
		const argVal = this.getNumOrVal(arg);

		this.vars[targetVar] = existingVar === argVal ? 1 : 0;
	}

	private getNumOrVal(arg: string): number {
		const result = parseInt(arg);
		return isNaN(result) ? this.safeGetVal(arg) : result;
	}

	private safeGetVal(variable: string): number {
		const value = this.vars[variable];
		if (value === undefined) {
			throw 'invalid input variable';
		}
		return value;
	}

	private loadFromCache(): boolean {
		if (this.lastInput === null) {
			this.logFn && this.logFn('First run - no cache');
			return false;
		}

		let cacheToUse = 0;
		// assuming the size of the input doesn't change
		for (let i = 0; i < this.input.length; i++) {
			const lastInput = this.lastInput[i];
			const newInput = this.input[i];

			if (lastInput === undefined || newInput === undefined) {
				throw 'invalid input';
			}

			if (lastInput !== newInput) {
				break;
			}
			cacheToUse++;
		}

		if (cacheToUse >= this.inputInstructions.length) {
			this.logFn && this.logFn('Same input as last time, will use cached result');
			return true;
		}

		this.vars = this.varCache[cacheToUse];
		this.curInstruction = this.inputInstructions[cacheToUse];
		this.curInput = cacheToUse;
		this.curInputInstruction = cacheToUse;

		this.logFn && this.logFn(`Using cache values starting at instruction ${this.curInstruction}: ${JSON.stringify(this.vars)}`);
		return false;
	}
}

class Day24Solver extends Solver {
	private commands: Array<string> = [];

	public init(inputFile: string): void {
		this.commands = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		this.initProgress(1e14);

		const alu = new ALU(this.commands);

		const digits = Array(14).fill(9);
		for (;;) {
			this.sampleLog(`Trying ${digits.join('')}`);
			alu.run(digits);
			if (alu.vars['z'] === 0) {
				break;
			}

			for (let i = 13; i >= 0; i--) {
				if (digits[i] > 1) {
					digits[i]--;
					break;
				}
				digits[i] = 9;
			}

			this.incrementProgress();
		}

		this.stopProgress();

		// Solved manually using Google sheets
		return `${digits.join('')}`;
	}

	protected solvePart2(): string {
		// Solved manually using Google sheets
		return `${'todo'}`;
	}
}

new Day24Solver().solveForArgs();

