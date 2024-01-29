import { use } from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

const { assert, request } = use(chaiHttp);

suite('Functional Tests', () => {
	suite('POST request /api/solve', () => {
		test('Solve a puzzle with valid puzzle string', (done) => {
			const input =
				'..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
			const output =
				'769235418851496372432178956174569283395842761628713549283657194516924837947381625';

			request(server)
				.post('/api/solve')
				.send({ puzzle: input })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'solution');
					assert.equal(res.body.solution, output);

					done();
				});
		});

		test('Solve a puzzle with missing puzzle string', (done) => {
			const output = 'Required field missing';

			request(server)
				.post('/api/solve')
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.equal(res.body.error, output);

					done();
				});
		});

		test('Solve a puzzle with invalid characters', (done) => {
			const input =
				'X.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
			const output = 'Invalid characters in puzzle';

			request(server)
				.post('/api/solve')
				.send({ puzzle: input })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.equal(res.body.error, output);

					done();
				});
		});

		test('Solve a puzzle with incorrect length', (done) => {
			const input = '.';
			const output = 'Expected puzzle to be 81 characters long';

			request(server)
				.post('/api/solve')
				.send({ puzzle: input })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.equal(res.body.error, output);

					done();
				});
		});

		test('Solve a puzzle that cannot be solved', (done) => {
			const input =
				'77...............................................................................';
			const output = 'Puzzle cannot be solved';

			request(server)
				.post('/api/solve')
				.send({ puzzle: input })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.equal(res.body.error, output);

					done();
				});
		});
	});

	suite('POST request /api/check', () => {
		let input;

		suiteSetup((done) => {
			input =
				'..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
			done();
		});

		test('Valid input and valid placement', (done) => {
			const coordinate = 'A1';
			const value = '7';
			const output = { valid: true };

			request(server)
				.post('/api/check')
				.send({ puzzle: input, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'valid');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Single placement conflict', (done) => {
			const coordinate = 'A3';
			const value = '1';
			const output = { valid: false, conflict: ['row'] };

			request(server)
				.post('/api/check')
				.send({ puzzle: input, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'valid');
					assert.property(res.body, 'conflict');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Multiple placement conflict', (done) => {
			const coordinate = 'A1';
			const value = '1';
			const output = { valid: false, conflict: ['row', 'col'] };

			request(server)
				.post('/api/check')
				.send({ puzzle: input, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'valid');
					assert.property(res.body, 'conflict');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('All placement conflicts', (done) => {
			const coordinate = 'A1';
			const value = '5';
			const output = { valid: false, conflict: ['row', 'col', 'region'] };

			request(server)
				.post('/api/check')
				.send({ puzzle: input, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'valid');
					assert.property(res.body, 'conflict');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Missing required fields', (done) => {
			const output = { error: 'Required field(s) missing' };

			request(server)
				.post('/api/check')
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Invalid characters', (done) => {
			const puzzle =
				'X.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
			const coordinate = 'A1';
			const value = '5';

			const output = { error: 'Invalid characters in puzzle' };

			request(server)
				.post('/api/check')
				.send({ puzzle, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Incorrect length', (done) => {
			const puzzle = '.';
			const coordinate = 'A1';
			const value = '5';

			const output = { error: 'Expected puzzle to be 81 characters long' };

			request(server)
				.post('/api/check')
				.send({ puzzle, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Invalid coordinate', (done) => {
			const puzzle =
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
			const coordinate = 'xx';
			const value = '5';

			const output = { error: 'Invalid coordinate' };

			request(server)
				.post('/api/check')
				.send({ puzzle, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.deepEqual(res.body, output);

					done();
				});
		});

		test('Invalid value', (done) => {
			const puzzle =
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
			const coordinate = 'A1';
			const value = 'X';

			const output = { error: 'Invalid value' };

			request(server)
				.post('/api/check')
				.send({ puzzle, coordinate, value })
				.end((err, res) => {
					assert.isObject(res.body);
					assert.property(res.body, 'error');
					assert.deepEqual(res.body, output);

					done();
				});
		});
	});
});
