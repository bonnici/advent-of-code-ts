import CliProgress, {SingleBar} from 'cli-progress';
import fs from 'fs';
import chalk from 'chalk';

export interface Solution {
	result: string;
	timeTaken: number;
}

export abstract class Solver {
	private progressBar: SingleBar;
	private progressBarMaxValue = 0;

	public abstract init(inputFile: string): void;

	protected abstract solvePart1(): string;

	protected abstract solvePart2(): string;

	constructor() {
		this.progressBar = new CliProgress.SingleBar({}, CliProgress.Presets.shades_classic);
	}

	public runPart1(): Solution {
		const timeBefore = (new Date()).getTime();
		const result = this.solvePart1();
		const timeAfter = (new Date()).getTime();

		return {result, timeTaken: timeAfter - timeBefore};
	}

	public runPart2(): Solution {
		const timeBefore = (new Date()).getTime();
		const result = this.solvePart2();
		const timeAfter = (new Date()).getTime();

		return {result, timeTaken: timeAfter - timeBefore};
	}

	public solveForArgs(): void {
		const args = process.argv.slice(2);
		const fileName = args[0] || 'input';
		const part = args[1] || '1';
		const expectedFile = args[2] || undefined;

		this.init(fileName);

		const solution = part === '1' ? this.runPart1() : this.runPart2();

		console.log(`Part ${part} solution: ${chalk.bold(solution.result)}`);
		console.log(`Part ${part} time taken: ${solution.timeTaken} ms`);

		if (expectedFile) {
			const expectedOutput = fs.readFileSync(expectedFile, 'utf8').trim();
			if (solution.result.localeCompare(expectedOutput) === 0) {
				console.log(chalk.green(`Solution ${chalk.bold(solution.result)} matched expected output.`));
			} else {
				console.log(chalk.red(`Solution ${chalk.bold(solution.result)} did not match expected output ${chalk.underline(expectedOutput)}.`));
			}
		}
	}

	protected verboseLog(...args: unknown[]): void {
		if (process.env.VERBOSE) {
			console.log(...args);
		}
	}

	protected initProgress(maxValue: number): void {
		this.progressBarMaxValue = maxValue;
		this.progressBar.start(this.progressBarMaxValue, 0);
	}

	protected reportProgress(value: number): void {
		this.progressBar.update(value);

		if (value >= this.progressBarMaxValue) {
			this.progressBar.stop();
		}
	}

	protected stopProgress(): void {
		this.progressBar.stop();
	}

	protected incrementProgress(): void {
		this.progressBar.increment();
	}
}
