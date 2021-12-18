import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import { binaryStringToDecimal, hexStringToBinaryString } from '../../common/Utils';

class Day16Solver extends Solver {
	private input = '';
	private binary = '';
	private offset = 0;

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile)[0];
		this.binary = hexStringToBinaryString(this.input);
	}

	protected solvePart1(): string {
		this.sampleLog(this.binary);

		const result = this.extractPacket();
		this.sampleLog('end of string', this.offset);

		return `${result.versionSum}`;
	}

	protected solvePart2(): string {
		const result = this.extractPacket();
		return `${result.value}`;
	}

	private extractNumber(length: number): number {
		const binaryStr = this.binary.substr(this.offset, length);
		this.offset += length;
		return binaryStringToDecimal(binaryStr);
	}

	private extractBinaryString(length: number): string {
		const binaryStr = this.binary.substr(this.offset, length);
		this.offset += length;
		return binaryStr;
	}

	private extractPacket(): { versionSum: number, value: number } {
		const result = { versionSum: 0, value: 0 };

		this.sampleLog('extractPacket offset', this.offset);
		const version = this.extractNumber(3);
		result.versionSum += version;
		this.sampleLog('Version', version);

		const type = this.extractNumber(3);
		this.sampleLog('Type', type);

		if (type === 4) {
			let isLast = false;
			let processedBits = 0;
			let binaryStr = '';
			while (!isLast) {
				const startingBit = this.extractNumber(1);
				this.sampleLog('startingBit', startingBit);

				isLast = startingBit === 0;

				const group = this.extractBinaryString(4);
				this.sampleLog('group', group);

				binaryStr += group;

				processedBits += 4;
			}

			const literalValue = binaryStringToDecimal(binaryStr);
			this.sampleLog('literalValue', literalValue);

			result.value = literalValue;

			const remainder = processedBits % 4;
			this.sampleLog('remainder', remainder);
			this.offset += remainder;
		} else {
			// operator
			const lengthType = this.extractNumber(1);
			this.sampleLog('lengthType', lengthType);

			const subValues = [];

			if (lengthType === 0) {
				// next 15 bits are a number that represents the total length in bits of the sub-packets contained by this packet
				const subpacketLength = this.extractNumber(15);
				this.sampleLog('subpacketLength', subpacketLength);

				const subpacketEnd = this.offset + subpacketLength;
				while (this.offset < subpacketEnd) {
					const subResult = this.extractPacket();
					result.versionSum += subResult.versionSum;
					subValues.push(subResult.value);
				}
			} else if (lengthType === 1) {
				// next 11 bits are a number that represents the number of sub-packets immediately contained by this packet
				const numSubpackets = this.extractNumber(11);
				this.sampleLog('numSubpackets', numSubpackets);

				for (let curSubpacket = 0; curSubpacket < numSubpackets; curSubpacket++) {
					const subResult = this.extractPacket();
					result.versionSum += subResult.versionSum;
					subValues.push(subResult.value);
				}

			} else {
				throw 'unexpected length type';
			}

			result.value = this.calculateSubpacketValue(type, subValues);
			this.sampleLog('calculateSubpacketValue', type, subValues, result.value);
		}

		return result;
	}

	private calculateSubpacketValue(type: number, subValues: number[]): number {
		switch (type) {
		case 0:
			// sum
			return subValues.reduce((acc, cur) => acc + cur, 0);
		case 1:
			// product
			return subValues.reduce((acc, cur) => acc * cur, 1);
		case 2:
			// minimum
			return Math.min(...subValues);
		case 3:
			// maximum
			return Math.max(...subValues);
		case 5:
			// greater than
			if (subValues.length !== 2) {
				throw 'unexpected greater than packet';
			}
			return subValues[0] > subValues[1] ? 1 : 0;
		case 6:
			// less than
			if (subValues.length !== 2) {
				throw 'unexpected less than packet';
			}
			return subValues[0] < subValues[1] ? 1 : 0;
		case 7:
			// equal to
			if (subValues.length !== 2) {
				throw 'unexpected equal to packet';
			}
			return subValues[0] === subValues[1] ? 1 : 0;
		default:
			throw 'unexpected type';
		}
	}
}

new Day16Solver().solveForArgs();