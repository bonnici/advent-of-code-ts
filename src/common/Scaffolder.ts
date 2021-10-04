import Handlebars from 'handlebars';
import * as fs from 'fs';

const readmeTemplate = Handlebars.compile(`
# [Advent of Code {{year}} Day {{day}}](https://adventofcode.com/{{year}}/day/{{day}})

TODO - copy over description
`);

const indexTemplate = Handlebars.compile(`
import { Solver } from "../../common/Solver";
import { InputParser}  from "../../common/InputParser";

class Day{{day}}Solver extends Solver {
	private input: Array<any> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		return 'todo';
	}

	protected solvePart2(): string {
		return 'todo';
	}
}

new Day{{day}}Solver().solveForArgs();
`);

export default class Scaffolder {
	public static scaffold(year: number, day: number): void {
		const readmeContent = readmeTemplate({year, day}).trim();
		const indexContent = indexTemplate({year, day}).trim();

		const dir = `./src/${year}/day${day}`;

		if (fs.existsSync(dir)) {
			console.error(`Directory ${dir} already exists! Delete to re-scaffold.`);
			return;
		}

		fs.mkdirSync(dir, {recursive: true});
		fs.writeFileSync(dir + '/README.md', readmeContent);
		fs.writeFileSync(dir + '/index.ts', indexContent);
		fs.writeFileSync(dir + '/input.txt', '');
		fs.writeFileSync(dir + '/sample.p1.txt', '');
		fs.writeFileSync(dir + '/sample.p2.txt', '');
		fs.writeFileSync(dir + '/sample.p1.expected.txt', '');
		fs.writeFileSync(dir + '/sample.p2.expected.txt', '');

		console.log(`Wrote scaffold files to ${dir}`);
	}
}
