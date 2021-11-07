/*
Helper class for a circular array of a generic type. Uses array internally so add/remove is inefficient.
*/

export default class CircularArrayList<Type> {
	public array: Array<Type> = [];


	public insert(value: Type, index: number): void {
		if (index < 0 || index > this.array.length) {
			throw 'invalid index';
		}

		if (index === this.array.length) {
			this.array.push(value);
		} else {
			this.array.splice(index, 0, value);
		}
	}

	public get(index: number): Type {
		if (index < 0 || index >= this.array.length) {
			throw 'invalid index';
		}

		return this.array[index];
	}

	public remove(index: number): Type {
		const value = this.get(index);

		this.array.splice(index, 1);

		return value;
	}

	public shiftIndex(index: number, shift: number): number {
		if (index < 0 || index >= this.array.length) {
			throw 'invalid index';
		}

		let newIndex = index + shift;
		while (newIndex < 0) {
			newIndex += this.array.length;
		}
		while (newIndex >= this.array.length) {
			newIndex -= this.array.length;
		}

		return newIndex;
	}
}
