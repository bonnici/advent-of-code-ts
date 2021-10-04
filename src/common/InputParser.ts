import * as fs from 'fs';

export class InputParser {
  public static readLines(path: string): string[] {
    return fs
      .readFileSync(path, 'utf8')
      .split('\n')
      .map((line: string) => line.trim())
      .filter(line => !!line);
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
    const lines = InputParser.readLines(path);

    const groups: string[][] = [];
    let curGroup: string[] = [];
    lines.forEach((line) => {
      if (line === '') {
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
