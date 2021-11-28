/*
Helper class for a circular double-ended linked list of a generic type.
*/

class ListNode<Type> {
	public constructor(public value: Type, public prev?: ListNode<Type>, public next?: ListNode<Type>) {}
}

export default class CircularLinkedList<Type> {
	public head: ListNode<Type>;
	public current: ListNode<Type>;

	public constructor(public initialNode: Type) {
		this.head = new ListNode<Type>(initialNode);
		this.head.prev = this.head;
		this.head.next = this.head;
		this.current = this.head;
	}

	public insertClockwise(value: Type): void {
		const newNode = new ListNode<Type>(value);

		const oldNext = this.current.next;
		if (!oldNext) {
			throw 'Invalid node';
		}

		this.current.next = newNode;
		newNode.next = oldNext;
		oldNext.prev = newNode;
		newNode.prev = this.current;
	}

	public getCurrent(): Type {
		return this.current.value;
	}

	public remove(): Type {
		const removed = this.current.value;

		if (!this.current.next) {
			throw 'Invalid node';
		}

		if (this.current === this.head) {
			this.head = this.current.next;
		}

		this.current = this.current.next;

		if (!this.current.prev) {
			throw 'Invalid node';
		}

		this.current.prev = this.current.prev.prev;

		if (!this.current.prev) {
			throw 'Invalid node';
		}

		this.current.prev.next = this.current;

		return removed;
	}

	public shiftCurrent(shift: number): void {
		while (shift > 0) {
			if (!this.current.next) {
				throw 'Invalid node';
			}
			this.current = this.current.next;
			shift -= 1;
		}

		while (shift < 0) {
			if (!this.current.prev) {
				throw 'Invalid node';
			}
			this.current = this.current.prev;
			shift += 1;
		}
	}

	public toString(): string {
		const values = [];

		let cur = this.head;
		values.push(cur.value);
		if (!cur.next) {
			throw 'Invalid node';
		}
		cur = cur.next;

		while (cur !== this.head) {
			values.push(cur.value);
			if (!cur.next) {
				throw 'Invalid node';
			}
			cur = cur.next;
		}

		return values.join(' ');
	}
}
