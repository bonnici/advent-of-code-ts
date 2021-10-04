import { Solver } from "../../common/Solver";
import { InputParser}  from "../../common/InputParser";

export default class Day2Solver extends Solver {
  private input: any;

  public init(inputFile: string) {
    this.input = InputParser.readLines(inputFile);
  }

  protected solvePart1(): string {
    return 'todo';
  }

  protected solvePart2(): string {
    return 'todo';
  }
}

new Day2Solver().solveForArgs();