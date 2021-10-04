import { Solver } from "../../common/Solver";
import { InputParser}  from "../../common/InputParser";
import GenericGrid from "../../common/GenericGrid";

interface Claim {
  claimId: number;
  fromLeft: number;
  fromTop: number;
  width: number;
  height: number;
}

// #123 @ 3,2: 5x4
const inputRe = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;

export default class Day3Solver extends Solver {
  private claims: Array<Claim> = [];
  // private grid: CharGrid = new CharGrid(0, 0);
  private grid = new GenericGrid<string>(0, 0, '.');

  public init(inputFile: string) {
    this.claims = InputParser.readLines(inputFile).map(Day3Solver.mapInput);

    const gridWidth = this.claims.reduce((acc, cur) => Math.max(acc, cur.fromLeft + cur.width), 0);
    const gridHeight = this.claims.reduce((acc, cur) => Math.max(acc, cur.fromTop + cur.height), 0);

    const compareFn = (a: string, b: string) => a.localeCompare(b);
    this.grid = new GenericGrid<string>(gridWidth, gridHeight, '.', compareFn, a => a);
  }

  protected solvePart1(): string {
    this.claims.forEach(c => {
      for (let x = c.fromLeft; x < c.fromLeft + c.width; x++) {
        for (let y = c.fromTop; y < c.fromTop + c.height; y++) {
          const char = this.grid.get(x, y);
          switch (char) {
            case '.':
              this.grid.set(x, y, '1');
              break;
            case '1':
              this.grid.set(x, y, '2');
              break;
            // No change for 2 or more
            default:
              break;
          }
        }
      }
    });

    return `${this.grid.countOccurrences('2')}`;
  }

  protected solvePart2(): string {
    return 'todo';
  }

  private static mapInput(line: string): Claim {
    const match = line.match(inputRe) || [];
    return {
      claimId: parseInt(match[1]),
      fromLeft: parseInt(match[2]),
      fromTop: parseInt(match[3]),
      width: parseInt(match[4]),
      height: parseInt(match[5]),
    }
  }
}

new Day3Solver().solveForArgs();
