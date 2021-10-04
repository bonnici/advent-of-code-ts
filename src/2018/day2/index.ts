import { Solver } from "../../common/Solver";
import { InputParser}  from "../../common/InputParser";

class Day2Solver extends Solver {
  private input: Array<string> = [];

  public init(inputFile: string): void {
    this.input = InputParser.readLines(inputFile);
  }

  protected solvePart1(): string {
    const twoChars = this.countLinesWithRepeatedChars(2);
    const threeChars = this.countLinesWithRepeatedChars(3);
    return `${twoChars * threeChars}`;
  }

  protected solvePart2(): string {
    let totalChecks = 0;
    for (let n = this.input.length - 1; n--; n > 0) {
      totalChecks += n;
    }
    this.initProgress(totalChecks);

    const { i, j } = this.findOffBySingleChar() || {};

    this.stopProgress();

    if (i && j) {
      return this.removeDiffChar(i, j);
    }

    return 'unknown';
  }

  private countLinesWithRepeatedChars(numChars: number): number {
    return this.input.filter(line => Day2Solver.hasRepeatedChars(line, numChars)).length;
  }

  private static hasRepeatedChars(line: string, numChars: number) {
    const charCounts = new Map();
    for (const char of line) {
      if (!charCounts.has(char)) {
        charCounts.set(char, 0);
      }
      charCounts.set(char, charCounts.get(char) + 1);
    }

    return [...charCounts.values()].some(count => count === numChars);
  }

  private findOffBySingleChar(): { i: number, j: number} | undefined {
    for (let i = 0; i < this.input.length; i++) {
      for (let j = i + 1; j < this.input.length; j++) {
        if (this.isOffBySingleChar(i, j)) {
          return { i, j };
        }
        this.incrementProgress();
      }
    }
  }

  private isOffBySingleChar(i: number, j: number) {
    let numDiffs = 0;
    for (let ch = 0; ch < this.input[i].length && numDiffs <= 1; ch++) {
      if (this.input[i].charAt(ch) !== this.input[j].charAt(ch)) {
        numDiffs++;
      }
    }

    return numDiffs === 1;
  }

  private removeDiffChar(i: number, j: number) {
    let result = '';
    for (let ch = 0; ch < this.input[i].length; ch++) {
      if (this.input[i].charAt(ch) === this.input[j].charAt(ch)) {
        result += this.input[i].charAt(ch);
      }
    }
    return result;
  }
}

new Day2Solver().solveForArgs();
