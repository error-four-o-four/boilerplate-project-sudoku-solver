import { assert } from 'chai';
import Solver from '../controllers/sudoku-solver.js';

suite('Unit Tests', () => {
	suite('static Function validatePuzzle(input)', () => {
		test('Strings that are 81 characters in length are accepted', (done) => {
			const input =
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';

			const error = Solver.validatePuzzle(input);
			assert.isNull(error);

			done();
		});

		test('Invalid characters (not 1-9 or .) are not accepted', (done) => {
			const input =
				'X.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
			const message = 'Invalid characters in puzzle';

			const error = Solver.validatePuzzle(input);
			assert.isNotNull(error);
			assert.equal(error.message, message);

			done();
		});

		test('Strings that are not 81 characters in length are not accepted', (done) => {
			const input = '.';

			const message = 'Expected puzzle to be 81 characters long';

			const error = Solver.validatePuzzle(input);
			assert.isNotNull(error);
			assert.equal(error.message, message);

			done();
		});
	});

	suite('Check Input Placement', () => {
		let solver;
		let coord;

		suiteSetup((done) => {
			const input =
				'..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';

			solver = new Solver(input);
			coord = 'A1';

			done();
		});

		suite('Function checkRowPlacement()', () => {
			test('Valid Row Placement', (done) => {
				const value = '3';
				const valid = solver.checkRowPlacement(coord, value);
				assert.isTrue(valid);
				done();
			});

			test('Invalid Row Placement', (done) => {
				const value = '9';
				const valid = solver.checkRowPlacement(coord, value);
				assert.isFalse(valid);
				done();
			});
		});

		suite('Function checkColPlacement()', () => {
			test('Valid Col Placement', (done) => {
				const value = '7';
				const valid = solver.checkColPlacement(coord, value);
				assert.isTrue(valid);
				done();
			});

			test('Invalid Col Placement', (done) => {
				const value = '8';
				const valid = solver.checkColPlacement(coord, value);
				assert.isFalse(valid);
				done();
			});
		});

		suite('Function checkRegionPlacement()', () => {
			test('Valid Region Placement', (done) => {
				const value = '7';
				const valid = solver.checkRegionPlacement(coord, value);
				assert.isTrue(valid);
				done();
			});

			test('Invalid Region Placement', (done) => {
				const value = '9';
				const valid = solver.checkRegionPlacement(coord, value);
				assert.isFalse(valid);
				done();
			});
		});

		suite('Solving Algorithm', () => {
			test('Valid puzzle strings pass', (done) => {
				const input =
					'769235418851496372432178956174569283395842761628713549283657194516924837947381625';

				const solver = new Solver(input);
				const solution = solver.solve();

				assert.isNotNull(solution);
				done();
			});

			test('Invalid puzzle strings fail', (done) => {
				const input =
					'779235418851496372432178956174569283395842761628713549283657194516924837947381625';

				const solver = new Solver(input);
				const solution = solver.solve();

				assert.isNull(solution);
				done();
			});

			test('Solves an incomplete puzzle string', (done) => {
				const input =
					'..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
				const output =
					'769235418851496372432178956174569283395842761628713549283657194516924837947381625';

				const solver = new Solver(input);
				const solution = solver.solve();

				assert.equal(output, solution);
				done();
			});
		});
	});
});
