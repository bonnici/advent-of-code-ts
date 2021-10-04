import { Solver } from "../../common/Solver";
import { InputParser}  from "../../common/InputParser";

export default class Day3Solver extends Solver {
  private input: any;

  public init(inputFile: string) {
    this.input = InputParser.readLines(inputFile);
  }

  protected solvePart1(): string {
    return `${this.countTrees(1, 3)}`;
  }

  protected solvePart2(): string {
    this.initProgress(5);

    const right1Down1 = this.countTrees(1, 1);
    this.reportProgress(1);
    const right3Down1 = this.countTrees(1, 3);
    this.reportProgress(2);
    const right5Down1 = this.countTrees(1, 5);
    this.reportProgress(3);
    const right7Down1 = this.countTrees(1, 7);
    this.reportProgress(4);
    const right1Down2 = this.countTrees(2, 1);
    this.reportProgress(5);

    return `${right1Down1 * right3Down1 * right5Down1 * right7Down1 * right1Down2}`;
  }

  private countTrees(downCount: number, rightCount: number) {
    let curRow = 0;
    let curCol = 0;
    let treeCount = 0;

    while (curRow < this.input.length) {
      const row = this.input[curRow];

      if (row[curCol] === '#') {
        treeCount++;
      }

      curCol += rightCount;
      if (curCol >= row.length) {
        curCol -= row.length;
      }

      curRow += downCount;
    }

    return treeCount;
  }
}

new Day3Solver().solveForArgs();
