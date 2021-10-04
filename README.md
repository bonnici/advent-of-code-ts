# Advent of Code

My TypeScript solutions for [Advent of Code 2021](https://adventofcode.com/2021). Includes a framework that should 
allow solutions to be written for other years, with some old solutions from 
[2020](https://github.com/bonnici/advent-of-code-2020) copied over as a test.

To run interactively, use `yarn cli` or `npx ts-node src/common/CliDriver.ts`.

To run a single solution, use a command like:
`VERBOSE=1 npx ts-node src/day4/index.ts 2020/day4/input.txt 2 expected.txt`
`VERBOSE` turns on verbose logging, which can be used to log extra data depending on the solution. The first parameter 
is the input file, the second parameter is the part to run (1 or 2), and the 3rd optional parameter is a file containing
the expected result (useful for the sample inputs/outputs in puzzle descriptions).

To debug through IntelliJ see [this page](https://www.jetbrains.com/help/idea/running-and-debugging-typescript.html#ws_ts_run_debug_server_side_ts_node).

Each solution is implemented as a subclass of the `Solver` class, which provides some shared functionality and a 
standard interface to implement. The `InputParser` static functions can be used to perform various manipulations of the 
input files.

Solvers for new days can be scaffolded using the `Scaffolder` class via the CLI.
