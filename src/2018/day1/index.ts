import { Solver } from "../../common/Solver";
import { InputParser}  from "../../common/InputParser";

class Day1Solver extends Solver {
  private input: Array<number> = [];

  public init(inputFile: string): void {
    this.input = InputParser.readLinesAsInts(inputFile);
  }

  protected solvePart1(): string {
    let result = 0;
    this.input.forEach((n: number) => result += n);
    return `${result}`;
  }

  protected solvePart2(): string {
    this.initProgress(this.input.length + 1);

    let result = 0;
    let curIdx = 0;
    const seen = new Set();
    for (;;) {
      this.reportProgress(curIdx);
      if (seen.has(result)) {
        this.stopProgress();
        return `${result}`;
      }

      seen.add(result);
      result += this.input[curIdx];
      curIdx++;
      if (curIdx >= this.input.length) {
        curIdx = 0;
      }
    }
  }
}

new Day1Solver().solveForArgs();
