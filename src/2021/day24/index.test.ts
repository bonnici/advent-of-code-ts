import { ALU } from './index';

describe.skip('ALU', () => {
	describe('multiply instruction', () => {
		test('positive number', () => {
			const alu = new ALU(
				[
					'inp x',
					'mul x -1',
				], 
				console.log);

			alu.run([3]);

			expect(alu.vars).toEqual({ w: 0, x: -3, y: 0, z: 0 });
		});

		test('negative number', () => {
			const alu = new ALU(
				[
					'inp w',
					'mul w -2',
				],
				console.log);

			alu.run([3]);

			expect(alu.vars).toEqual({ w: -6, x: 0, y: 0, z: 0 });
		});
	});

	describe('equal instruction', () => {
		test('is equal', () => {
			const alu = new ALU(
				[
					'inp z',
					'inp x',
					'mul z 3',
					'eql z x',
				],
				console.log);

			alu.run([1, 3]);

			expect(alu.vars).toEqual({ w: 0, x: 3, y: 0, z: 1 });
		});

		test('is not equal', () => {
			const alu = new ALU(
				[
					'inp w',
					'inp y',
					'mul y 3',
					'eql y w',
				],
				console.log);

			alu.run([2, 3]);

			expect(alu.vars).toEqual({ w: 2, x: 0, y: 0, z: 0 });
		});
	});

	describe('extract bits', () => {
		const instructions = [
			'inp w',
			'add z w',
			'mod z 2',
			'div w 2',
			'add y w',
			'mod y 2',
			'div w 2',
			'add x w',
			'mod x 2',
			'div w 2',
			'mod w 2',
		];
		test('3', () => {
			const alu = new ALU(instructions, console.log);
			alu.run([3]);
			expect(alu.vars).toEqual({ w: 0, x: 0, y: 1, z: 1 });
		});
		test('5', () => {
			const alu = new ALU(instructions, console.log);
			alu.run([5]);
			expect(alu.vars).toEqual({ w: 0, x: 1, y: 0, z: 1 });
		});
		test('15', () => {
			const alu = new ALU(instructions, console.log);
			alu.run([15]);
			expect(alu.vars).toEqual({ w: 1, x: 1, y: 1, z: 1 });
		});
		test('16', () => {
			const alu = new ALU(instructions, console.log);
			alu.run([16]);
			expect(alu.vars).toEqual({ w: 0, x: 0, y: 0, z: 0 });
		});
	});

	describe('caching', () => {
		test('can rerun', () => {
			const alu = new ALU(
				[
					'inp x',
					'mul x -1',
				],
				console.log
			);

			alu.run([16]);
			expect(alu.vars).toEqual({ w: 0, x: -16, y: 0, z: 0 });

			alu.run([1]);
			expect(alu.vars).toEqual({ w: 0, x: -1, y: 0, z: 0 });
		});

		test('skips when partially cached', () => {
			const alu = new ALU(
				[
					'inp x',
					'mul x -1',
					'inp y',
					'mul y 2',
				],
				console.log
			);

			alu.run([3, 4]);
			expect(alu.vars).toEqual({ w: 0, x: -3, y: 8, z: 0 });

			// use debugging/logs to verify cache behaviour
			alu.run([3, 5]);
			expect(alu.vars).toEqual({ w: 0, x: -3, y: 10, z: 0 });
		});

		test('skips all when fully cached', () => {
			const alu = new ALU(
				[
					'inp x',
					'mul x -1',
					'inp y',
					'mul y 2',
				],
				console.log
			);

			alu.run([3, 4]);
			expect(alu.vars).toEqual({ w: 0, x: -3, y: 8, z: 0 });

			// use debugging/logs to verify cache behaviour
			alu.run([3, 4]);
			expect(alu.vars).toEqual({ w: 0, x: -3, y: 8, z: 0 });
		});

		test('skips none when can\'t cache', () => {
			const alu = new ALU(
				[
					'inp x',
					'mul x -1',
					'inp y',
					'mul y 2',
				],
				console.log
			);

			alu.run([3, 4]);
			expect(alu.vars).toEqual({ w: 0, x: -3, y: 8, z: 0 });

			// use debugging/logs to verify cache behaviour
			alu.run([4, 4]);
			expect(alu.vars).toEqual({ w: 0, x: -4, y: 8, z: 0 });
		});
	});

	describe('benchmarking', () => {
		const instructions = [
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 10',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 10',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 13',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 5',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 15',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 12',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -12',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 12',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 14',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 6',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -2',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 4',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 13',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 15',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -12',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 3',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 15',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 7',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 1',
			'add x 11',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 11',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -3',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 2',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -13',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 12',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -12',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 4',
			'mul y x',
			'add z y',
			'inp w',
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z 26',
			'add x -13',
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y 11',
			'mul y x',
			'add z y',
		];

		test('10 ops', () => {
			const alu = new ALU(instructions, console.log);

			const timeBefore = new Date().getTime();

			const digits = Array(14).fill(9);
			for (let i = 0; i < 10; i++) {
				alu.run(digits);
				if (alu.vars['z'] === 0) {
					break;
				}

				for (let i = 13; i >= 0; i--) {
					if (digits[i] > 1) {
						digits[i]--;
						break;
					}
					digits[i] = 9;
				}
			}

			const timeAfter = new Date().getTime();
			const timeTaken = timeAfter - timeBefore;
			console.log(`Time taken: ${timeTaken} ms`);
		});

		test('10000 ops', () => {
			const alu = new ALU(instructions);

			const timeBefore = new Date().getTime();

			const digits = Array(14).fill(9);
			for (let i = 0; i < 10000; i++) {
				alu.run(digits);
				if (alu.vars['z'] === 0) {
					break;
				}

				for (let i = 13; i >= 0; i--) {
					if (digits[i] > 1) {
						digits[i]--;
						break;
					}
					digits[i] = 9;
				}
			}

			const timeAfter = new Date().getTime();
			const timeTaken = timeAfter - timeBefore;
			console.log(`Time taken: ${timeTaken} ms`);

			// no caching: 1371 ms
			// after caching: 125 ms
			// after precomputing: 28 ms
			// after changing groups with single function: 7 ms
		});
	});

	describe('repeated function', () => {
		const baseInstructions = [
			'inp w', // input digit
			'mul x 0',
			'add x z',
			'mod x 26',
			'div z ARG_1', // 1 or 26
			'add x ARG_2', // -13 to 15
			'eql x w',
			'eql x 0',
			'mul y 0',
			'add y 25',
			'mul y x',
			'add y 1',
			'mul z y',
			'mul y 0',
			'add y w',
			'add y ARG_3', // 2 to 15
			'mul y x',
			'add z y',
		];

		const buildInstructions = (arg1: number, arg2: number, arg3: number): Array<string> =>
			baseInstructions.map(s => s
				.replace('ARG_1', `${arg1}`)
				.replace('ARG_2', `${arg2}`)
				.replace('ARG_3', `${arg3}`)
			);

		// Z and Y are cleared out before use and W is never changed, so Z is the only output that matters
		const extractZ = (input: number, startingZ: number, instructions: Array<string>): number => {
			const alu = new ALU(instructions);
			alu.vars.z = startingZ;
			alu.run([input]);
			return alu.vars.z;
		};

		test('first input', () => {
			const instructions = buildInstructions(1, 10, 10);

			/*
			const startingZ = 0; // Z always starts at 0
			for (let digit = 1; digit <= 9; digit++) {
				const result = extractZ(digit, startingZ, instructions);
				console.log(`Result for input ${digit} = ${result}`);
			}
			*/

			// After first digit, W = input * 10, or W = z*26 (0) + i + 10

			// Used google sheets and traced through instructions:
			// if i == ((z % 26) + 10), z = z, else z = (z * 26) + (i + 10)
			//                     ARG2                                 ARG3

			let result = extractZ(10, 0, instructions);
			console.log(`Result for starting z of ${0} and input ${10} = ${result}`); // expect this to be 0

			result = extractZ(13, 3, instructions);
			console.log(`Result for starting z of ${3} and input ${13} = ${result}`); // expect this to be 3

			result = extractZ(13, 29, instructions);
			console.log(`Result for starting z of ${29} and input ${13} = ${result}`); // expect this to be 29

			result = extractZ(14, 29, instructions);
			console.log(`Result for starting z of ${29} and input ${14} = ${result}`); // expect this to be 778

			result = extractZ(13, 30, instructions);
			console.log(`Result for starting z of ${30} and input ${13} = ${result}`); // expect this to be 803
		});

		test('second input', () => {
			const instructions = buildInstructions(1, 13, 5);

			/*
			for (let startingZ = 11; startingZ <= 19; startingZ++) {
				for (let digit = 1; digit <= 9; digit++) {
					const result = extractZ(digit, startingZ, instructions);
					console.log(`Result for starting z of ${startingZ} and input ${digit} = ${result}`);
				}
			}
			*/

			// z=11, i=1: r=292
			// z=11, i=2: r=293
			// z=11: r=291+i (5 + z*26 + i)
			// z=12, i=1: r=318
			// z=12: r=317+i (diff=26)
			// z=13, i=1: r=344
			// z=13: r=343+i (diff=26)
			// z=14, i=1: r=370
			// z=14: r=369+i (diff=26)

			// After second digit, W = z*26 + i + 5

			// Used google sheets and traced through instructions:
			// if i == ((z % 26) + 13), z = z, else z = (z * 26) + (i + 5)
			//                     ARG2                                 ARG3

			let result = extractZ(16, 3, instructions);
			console.log(`Result for starting z of ${3} and input ${16} = ${result}`); // expect this to be 3

			result = extractZ(26, 13, instructions);
			console.log(`Result for starting z of ${13} and input ${26} = ${result}`); // expect this to be 13

			result = extractZ(27, 13, instructions);
			console.log(`Result for starting z of ${13} and input ${27} = ${result}`); // expect this to be 370
		});

		test('fourth input', () => {
			const instructions = buildInstructions(26, -12, 13); // changed arg3 to keep it interesting

			// Used google sheets and traced through instructions (when first input was 26, not generalised):
			// if i == ((z % 26) - 12), z = z / 26, else z = (z / 26) + (i + 13)
			//                     ARG2         ARG1              ARG1       ARG3

			let result = extractZ(12, 24, instructions);
			console.log(`Result for starting z of ${24} and input ${12} = ${result}`); // expect this to be 24/26=0

			result = extractZ(12, 25, instructions);
			console.log(`Result for starting z of ${13} and input ${26} = ${result}`); // expect this to be 50

			result = extractZ(-8, 30, instructions);
			console.log(`Result for starting z of ${30} and input ${-8} = ${result}`); // expect this to be 30/26=1

			result = extractZ(-4, 60, instructions);
			console.log(`Result for starting z of ${60} and input ${-4} = ${result}`); // expect this to be 60/26=2
		});
	});
});