import Handlebars from "handlebars";
import * as fs from 'fs';
import CliProgress from "cli-progress";

/*
Helper class for grid of characters.
0,0 is top left corner.
1,0 is 1 square left from top left.
0,1 is 1 square down from top left.
*/
export default class CharGrid {
  private grid: Array<string>;

  constructor(public width: number, public height: number, emptyChar = '.') {
    this.grid = emptyChar.repeat(width * height).split('');
  }

  public get(x: number, y: number): string {
    return this.grid[this.pos(x, y)];
  }

  public set(x: number, y: number, val: string): void {
    this.grid[this.pos(x, y)] = val;
  }

  public countOccurrences(val: string): number {
    return this.grid.reduce((acc, cur) => acc + (cur.localeCompare(val) === 0 ? 1 : 0), 0);
  }

  public toString(): string {
    return (this.grid.join('').match(new RegExp('.{1,' + this.width + '}', 'g')) || []).join('\n')
  }

  private pos(x: number, y: number) {
    return (y * this.width) + x;
  }
}
