import * as fs from 'fs';

export class InputParser {
	public static readString(path: string): string {
		return fs.readFileSync(path, 'utf8').trim();
	}

	public static readLines(path: string, shouldFilter = true): string[] {
		return fs
			.readFileSync(path, 'utf8')
			.split('\n')
			.map((line: string) => line.trim())
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

	public static readLinesInGroups(path: string): string[][] {
		const lines = InputParser.readLines(path, false);

		const groups: string[][] = [];
		let curGroup: string[] = [];
		lines.forEach((line) => {
			if ((line || '').trim() === '') {
				groups.push(curGroup);
				curGroup = [];
			} else {
				curGroup.push(line);
			}
		});
		groups.push(curGroup);

		return groups;
	}
}
