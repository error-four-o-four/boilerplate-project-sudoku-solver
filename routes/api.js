'use strict';

import Solver from '../controllers/sudoku-solver.js';

export default function (app) {
	let solver = new Solver();

	app.route('/api/check').post((req, res) => {});

	app.route('/api/solve').post((req, res) => {});
}
