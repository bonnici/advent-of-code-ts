# Advent of Code

My newer TypeScript solutions for [Advent of Code](https://adventofcode.com/) along with a framework that 
allows new days to be scaffolded and solutions to be written quickly.

The solutions include:
* Some from [2020](https://adventofcode.com/2020) copied over from
 [advent-of-code-2020](https://github.com/bonnici/advent-of-code-2020) to help create the framework
* Some from [2018](https://adventofcode.com/2018), written to practice using the framework
* In-progress solutions from [2021](https://adventofcode.com/2021)
* Note that [2019](https://adventofcode.com/2019) solutions are not included but what I got up to can be found at 
 [advent-of-code-2019](https://github.com/bonnici/advent-of-code-2019)

To run interactively, use `yarn cli` or `npx ts-node src/common/CliDriver.ts`. The CLI will look for the latest solution
code in the latest year and start running for that day and year. Add a year parameter to start for a different year, 
e.g. `yarn cli 2018`. The CLI will either run a solution or scaffold the code for another day's solution.

To run a single solution without using the CLI, use a command like:
`cross-env npx ts-node src/day4/index.ts 2020/day4/input.txt 2 expected.txt`
The first parameter is the input file, the second parameter is the part to run (1 or 2), and the 3rd optional parameter 
is a file containing the expected result (useful for the sample inputs/outputs in puzzle descriptions). Logging via the
`sampleLog` function will log out to console only when a sample solution is passed in.

To debug through IntelliJ see 
[this page](https://www.jetbrains.com/help/idea/running-and-debugging-typescript.html#ws_ts_run_debug_server_side_ts_node).

Each solution is implemented as a subclass of the `Solver` class, which provides some shared functionality (e.g. logging 
and progress bars) and a standard interface to implement. The `InputParser` static functions can be used to perform 
various manipulations of the input files. The `Utils` file and other files in the common folder contain some random 
helper functions/classes.