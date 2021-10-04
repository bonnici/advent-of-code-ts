/*
Helper class for grid of a generic type.
0,0 is top left corner.
1,0 is 1 square left from top left.
0,1 is 1 square down from top left.
*/
export default class CharGrid<Type> {
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

	public get(x: number, y: number): Type {
		return this.elems[this.index(x, y)];
	}

	public set(x: number, y: number, val: Type): void {
		this.elems[this.index(x, y)] = val;
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
}
