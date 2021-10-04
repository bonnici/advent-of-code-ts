import Handlebars from "handlebars";
import * as fs from 'fs';
import CliProgress from "cli-progress";

/*
Helper class for grid of a generic type.
0,0 is top left corner.
1,0 is 1 square left from top left.
0,1 is 1 square down from top left.
*/
export default class CharGrid<Type> {
  private grid: Array<Type>;

  constructor(
      public width: number,
      public height: number,
      private initialVal: Type,
      private compareFn?: (a: Type, b: Type) => number,
      private renderFn?: (a: Type) => string, // Should render single character
  ) {
    this.grid = new Array<Type>(width * height);
    this.grid.fill(initialVal);
  }

  public get(x: number, y: number): Type {
    return this.grid[this.pos(x, y)];
  }

  public set(x: number, y: number, val: Type): void {
    this.grid[this.pos(x, y)] = val;
  }

  public countOccurrences(val: Type): number {
    if (!this.compareFn) {
      throw "No compare function";
    }

    return this.grid.reduce((acc, cur) => acc + (this.compareFn!(cur, val) === 0 ? 1 : 0), 0);
  }

  public toString(): string {
    if (!this.renderFn) {
      throw "No render function";
    }

    const renderedElems = this.grid
        .map(e => this.renderFn!(e))
        .join('')
        .match(new RegExp('.{1,' + this.width + '}', 'g')) || [];
    return renderedElems.join('\n')
  }

  private pos(x: number, y: number) {
    return (y * this.width) + x;
  }
}
