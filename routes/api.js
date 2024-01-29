'use strict';

import Solver from '../controllers/sudoku-solver.js';

export default function (app) {
	app.route('/api/check').post((req, res) => {
		const { puzzle, coordinate, value } = req.body;

		const inputError = Solver.validateInput(coordinate, value);

		if (inputError) {
			return res.json({ error: inputError.message });
		}

		const puzzleError = Solver.validatePuzzle(puzzle);

		if (puzzleError) {
			return res.json({ error: puzzleError.message });
		}

		const solver = new Solver(puzzle);

		if (solver.checkValue(coordinate, value)) {
			return res.json({ valid: true });
		}

		const conflict = [];

		if (!solver.checkRowPlacement(coordinate, value)) {
			conflict.push('row');
		}

		if (!solver.checkColPlacement(coordinate, value)) {
			conflict.push('col');
		}

		if (!solver.checkRegionPlacement(coordinate, value)) {
			conflict.push('region');
		}

		if (Boolean(conflict.length)) {
			return res.json({
				valid: false,
				conflict,
			});
		}

		return res.json({ valid: true });
	});

	app.route('/api/solve').post((req, res) => {
		const { puzzle } = req.body;

		if (!puzzle) {
			return res.json({ error: 'Required field missing' });
		}

		const error = Solver.validatePuzzle(puzzle);

		if (error) {
			return res.json({ error: error.message });
		}

		const solver = new Solver(puzzle);
		const solution = solver.solve();

		if (!solution) {
			return res.json({ error: 'Puzzle cannot be solved' });
		}

		return res.json({ solution });
	});
}
