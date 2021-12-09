/*
Helper class for grid of a generic type.
0,0 is top left corner.
1,0 is 1 square right from top left.
0,1 is 1 square down from top left.
*/

import Coord from './Coord';

export default class GenericGrid<Type> {
	private readonly elems: Array<Type>;

	constructor(
		public width: number,
		public height: number,
		private initFn: () => Type,
		private compareFn?: (a: Type, b: Type) => number,
		private renderFn?: (a: Type) => string, // Should render single character
	) {
		this.elems = new Array<Type>(width * height);
		this.elems = Array.from({ length: width * height }, initFn);
	}

	public get elements(): Array<Type> {
		return this.elems;
	}

	// Deprecated
	public get(x: number, y: number): Type {
		return this.elems[this.index(x, y)];
	}

	// get coord
	public getC(c: Coord): Type {
		return this.elems[this.indexC(c)];
	}

	public safeGet(c: Coord): Type | undefined {
		if (!this.inBounds(c)) {
			return undefined;
		}

		return this.getC(c);
	}

	// Deprecated
	public set(x: number, y: number, val: Type): void {
		this.elems[this.index(x, y)] = val;
	}

	public setC(c: Coord, val: Type): void {
		this.elems[this.indexC(c)] = val;
	}

	public countOccurrences(val: Type): number {
		const compareFn = this.compareFn; // Needed to appease TypeScript

		if (!compareFn) {
			throw 'No compare function';
		}

		return this.elems.reduce((acc, cur) => acc + (compareFn(cur, val) === 0 ? 1 : 0), 0);
	}

	public toString(): string {
		const renderFn = this.renderFn; // Needed to appease TypeScript

		if (!renderFn) {
			throw 'No render function';
		}

		const renderedElems = this.elems
			.map(e => renderFn(e))
			.join('')
			// Split into lines each with a size equal to the grid width
			.match(new RegExp('.{1,' + this.width + '}', 'g')) || [];
		return renderedElems.join('\n');
	}

	private index(x: number, y: number) {
		return (y * this.width) + x;
	}

	private indexC(c: Coord) {
		return (c.y * this.width) + c.x;
	}

	private inBounds(c: Coord) {
		return c.x >= 0 && c.x < this.width && c.y >= 0 && c.y < this.height;
	}
}
