import * as fs from 'fs';
import GenericGrid from './GenericGrid';

export class InputParser {
	public static readString(path: string): string {
		return fs.readFileSync(path, 'utf8').trim();
	}

	public static readLines(path: string, shouldFilter = true, shouldTrim = true): string[] {
		return fs
			.readFileSync(path, 'utf8')
			.split('\n')
			.map((line: string) => shouldTrim ? line.trim() : line)
			.filter(line => !shouldFilter || !!line);
	}

	public static readFirstLineAsInts(path: string): number[] {
		return InputParser.readLines(path)[0].split(' ').map(n => parseInt(n, 10));
	}

	public static readLinesAsInts(path: string): number[] {
		return InputParser.readLines(path).map(line => parseInt(line, 10));
	}

	public static readLinesAsChars(path: string): string[][] {
		return InputParser.readLines(path).map(line => line.split(''));
	}

	public static readLinesWithTransform<Type>(path: string, transform: (line: string) => Type): Type[] {
		return InputParser.readLines(path).map(line => transform(line));
	}

	public static readLinesInGroups(path: string, shouldTrim = true): string[][] {
		const lines = InputParser.readLines(path, false, shouldTrim);

		const groups: string[][] = [];
		let curGroup: string[] = [];
		lines.forEach((line) => {
			if ((line.trim() || '').trim() === '') {
				groups.push(curGroup);
				curGroup = [];
			} else {
				curGroup.push(line);
			}
		});
		groups.push(curGroup);

		return groups;
	}

	public static readLinesInGroupsWithTransform<Type>(path: string, transform: (line: string) => Type): Type[][] {
		const groupsStr = InputParser.readLinesInGroups(path);
		const groups: Type[][] = [];
		groupsStr.forEach((group) => {
			groups.push(group.map(transform));
		});

		return groups;
	}

	public static readLinesAsNumberGrid(path: string): GenericGrid<number> {
		const chars = InputParser.readLinesAsChars(path);
		const grid = new GenericGrid<number>(
			chars[0].length,
			chars.length,
			() => 0,
			(a, b) => a - b,
			(n) => `${n}`,
		);
		for (let i = 0; i < chars.length; i++) {
			const line = chars[i];
			for (let j = 0; j < line.length; j++) {
				grid.set(j, i, parseInt(line[j]));
			}
		}

		return grid;
	}


	public static readLinesAsCharGrid(path: string): GenericGrid<string> {
		const chars = InputParser.readLinesAsChars(path);
		const grid = new GenericGrid<string>(
			chars[0].length,
			chars.length,
			() => '.',
			(a, b) => a.localeCompare(b),
			s => s,
		);
		for (let i = 0; i < chars.length; i++) {
			const line = chars[i];
			for (let j = 0; j < line.length; j++) {
				grid.set(j, i, line[j]);
			}
		}

		return grid;
	}

	public static lineToNumbers(line: string): number[] {
		return line.split(',').map(s => parseInt(s));
	}
}
