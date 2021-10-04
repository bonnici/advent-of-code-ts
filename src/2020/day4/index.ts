import {Solver} from '../../common/Solver';
import {InputParser} from '../../common/InputParser';

class PassportFields {
	fields: { [name: string]: string } = {};
	hclRegex = /^#[0-9a-f]{6}$/;
	pidRegex = /^[0-9]{9}$/;

	constructor(fields: string) {
		const fieldsSplit = fields.split(' ').filter(s => !!s);
		for (const curField of fieldsSplit) {
			this.fields[curField.substr(0, 3)] = curField.substr(4).trim();
		}
	}

	isValidPt1() {
		return !!this.fields.byr && !!this.fields.iyr && !!this.fields.eyr && !!this.fields.hgt && !!this.fields.hcl
			&& !!this.fields.ecl && !!this.fields.pid;
	}

	isValidPt2(logFn: (...args: string[]) => void) {
		const birth = parseInt(this.fields.byr, 10);
		if (!birth || birth < 1920 || birth > 2002) {
			logFn(`Invalid byr: ${this.fields.byr}`);
			return false;
		}

		const issue = parseInt(this.fields.iyr, 10);
		if (!issue || issue < 2010 || issue > 2020) {
			logFn(`Invalid iyr: ${this.fields.iyr}`);
			return false;
		}

		const expire = parseInt(this.fields.eyr, 10);
		if (!expire || expire < 2020 || expire > 2030) {
			logFn(`Invalid eyr: ${this.fields.eyr}`);
			return false;
		}

		if (!this.fields.hgt) {
			logFn(`Invalid hgt: ${this.fields.hgt}`);
			return false;
		}
		const height = parseInt(this.fields.hgt, 10);
		// could add more strict test on height starting with number here
		const heightUnit = this.fields.hgt.slice(-2);
		switch (heightUnit) {
		case 'cm':
			if (!height || height < 150 || height > 193) {
				logFn(`Invalid hgt: ${this.fields.hgt}`);
				return false;
			}
			break;
		case 'in':
			if (!height || height < 59 || height > 76) {
				logFn(`Invalid hgt: ${this.fields.hgt}`);
				return false;
			}
			break;
		default:
			logFn(`Invalid hgt: ${this.fields.hgt}`);
			return false;
		}

		if (!this.hclRegex.test(this.fields.hcl)) {
			logFn(`Invalid hcl: ${this.fields.hcl}`);
			return false;
		}

		if (!['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].includes(this.fields.ecl)) {
			logFn(`Invalid ecl: ${this.fields.ecl}`);
			return false;
		}

		if (!this.pidRegex.test(this.fields.pid)) {
			logFn(`Invalid pid: ${this.fields.pid}`);
			return false;
		}

		return true;
	}

	toString() {
		return `byr:${this.fields.byr} iyr:${this.fields.iyr} eyr:${this.fields.eyr} hgt:${this.fields.hgt} `
			+ `hcl:${this.fields.hcl} ecl:${this.fields.ecl} pid:${this.fields.pid} cid:${this.fields.cid} `;
	}
}

class Day4Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		const passportFields: PassportFields[] = [];
		let curFields = '';
		this.input.forEach((line: string) => {
			if (line === '') {
				passportFields.push(new PassportFields(curFields));
				curFields = '';
			} else {
				curFields += ' ' + line;
			}
		});
		passportFields.push(new PassportFields(curFields));

		let validPt1Count = 0;
		for (const passport of passportFields) {
			const isValidPt1 = passport.isValidPt1();
			if (isValidPt1) {
				validPt1Count++;
			}
		}

		return `${validPt1Count}`;
	}

	protected solvePart2(): string {
		const passportFields: PassportFields[] = [];
		let curFields = '';
		this.input.forEach((line: string) => {
			if (line === '') {
				passportFields.push(new PassportFields(curFields));
				curFields = '';
			} else {
				curFields += ' ' + line;
			}
		});
		passportFields.push(new PassportFields(curFields));

		let validPt2Count = 0;
		for (const passport of passportFields) {
			const isValidPt2 = passport.isValidPt2(this.verboseLog);
			if (isValidPt2) {
				validPt2Count++;
			}
		}

		return `${validPt2Count}`;
	}

}

new Day4Solver().solveForArgs();
