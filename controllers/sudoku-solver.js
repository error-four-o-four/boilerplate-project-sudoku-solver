import SudokuCell from './sudoku-cell.js';

export default class SudokuSolver {
	static validateInput(coordinate, value) {
		if (!coordinate || !value) {
			return {
				message: 'Required field(s) missing',
			};
		}

		if (
			!/^\D\d$/.test(coordinate) ||
			!/[abcdefghi]/.test(coordinate[0].toLowerCase())
		) {
			return {
				message: 'Invalid coordinate',
			};
		}

		if (!/^\d$/.test(value) || value < 1 || value > 9) {
			return {
				message: 'Invalid value',
			};
		}

		return null;
	}

	static validatePuzzle(puzzleString) {
		if (puzzleString.length !== 81) {
			return {
				message: 'Expected puzzle to be 81 characters long',
			};
		}

		if (!/^[\d|\.]+$/.test(puzzleString)) {
			return {
				message: 'Invalid characters in puzzle',
			};
		}

		return null;
	}

	constructor(puzzleString) {
		this.puzzle = puzzleString;
		this.cells = new Map();

		// create the map
		for (let i = 0; i < puzzleString.length; i += 1) {
			const [col, row] = SudokuCell.index2vert(i);
			const coord = SudokuCell.vert2coord(col, row);
			const char = puzzleString[i];

			this.cells.set(coord, new SudokuCell(coord, char));
		}

		for (const [coord, cell] of this.cells.entries()) {
			// skip if cell is assigned
			if (cell.hasValue()) continue;

			// get relevant neighbouring cells
			const cells = this.getCells(coord, cell);
			cell.createCandidates(cells);
		}
	}

	getCell(coord) {
		return this.cells.get(`${coord[0].toUpperCase()}${parseInt(coord[1], 10)}`);
	}

	getCellsInRow(coord) {
		const cells = [];
		const row = coord[0].toUpperCase();
		for (let col = 1; col <= 9; col += 1) {
			cells.push(this.cells.get(`${row}${col}`));
		}
		return cells;
	}

	getCellsInCol(coord) {
		const cells = [];
		const x = coord[1] - 1;
		for (let y = 0; y < 9; y += 1) {
			const cell = SudokuCell.vert2coord(x, y);
			cells.push(this.cells.get(cell));
		}
		return cells;
	}

	getCellsInRegion(coord) {
		const cells = [];
		const [x, y] = SudokuCell.coord2vert(coord).map(
			(val) => Math.floor(val / 3) * 3
		);

		for (let j = 0; j < 3; j += 1) {
			for (let i = 0; i < 3; i += 1) {
				const cell = SudokuCell.vert2coord(x + i, y + j);
				cells.push(this.cells.get(cell));
			}
		}
		return cells;
	}

	getCells(coord, cell) {
		const col = this.getCellsInCol(coord);
		const row = this.getCellsInRow(coord);
		const region = this.getCellsInRegion(coord);

		const cells = new Set([...col, ...row, ...region]);
		cells.delete(cell);

		return [...cells];
	}

	getUnassignedCell() {
		for (const cell of this.cells.values()) {
			if (!cell.hasValue()) return cell;
		}

		return null;
	}

	checkRowPlacement(coord, char) {
		const values = this.getCellsInRow(coord).map((cell) => cell.value);
		return !values.includes(char);
		// const puzzleRow = this._puzzle[row];
		// return puzzleRow.includes(num);
	}

	checkColPlacement(coord, char) {
		const values = this.getCellsInCol(coord).map((cell) => cell.value);
		return !values.includes(char);
		// const puzzleCol = this._puzzle.reduce((all, row) => [...all, row[col]], []);
		// return puzzleCol.includes(num);
	}

	checkRegionPlacement(coord, char) {
		const values = this.getCellsInRegion(coord).map((cell) => cell.value);
		return !values.includes(char);
		// const puzzleRegion = [];
		// let [regionRow, regionCol] = [row, col].map(
		// 	(val) => Math.floor(val / 3) * 3
		// );
		// for (let j = 0; j < 3; j += 1) {
		// 	for (let i = 0; i < 3; i += 1) {
		// 		const val = this._puzzle[regionRow + j][regionCol + i];
		// 		puzzleRegion.push(val);
		// 	}
		// }
		// return puzzleRegion.includes(num);
	}

	check(coord, cell, char) {
		const values = this.getCells(coord, cell).map((cell) => cell.value);
		return !values.includes(char);
	}

	checkValue(coord, char) {
		const cell = this.getCell(coord);
		return cell.hasValue() && cell.value === char;
	}

	checkCells() {
		for (const cell of this.cells.values()) {
			if (!cell.hasValue()) continue;

			if (!this.check(cell.coord, cell, cell.value)) {
				return false;
			}
		}

		return true;
	}

	solveCandidates() {
		const targets = [...this.cells.values()].filter(
			(cell) => !cell.hasValue() && cell.candidates.length === 1
		);

		if (targets.length === 0) return;

		for (const cell of targets) {
			cell.setCandidateAsValue();
			this.getCells(cell.coord, cell).forEach((item) =>
				item.removeCandidate(cell.value)
			);
		}

		this.solveCandidates();
	}

	solveRecursive(recursions = 0) {
		recursions += 1;

		if (recursions >= 250_000) {
			return false;
		}

		const cell = this.getUnassignedCell();

		if (!cell) {
			return true;
		}

		for (const candidate of cell.candidates) {
			if (this.check(cell.coord, cell, candidate)) {
				cell.setValue(candidate);

				if (this.solveRecursive(recursions)) {
					return true;
				}

				cell.clearValue();
			}
		}

		return false;
	}

	solve() {
		if (!this.checkCells()) {
			return null;
		}

		// find cells with fewest candidates
		// set cell value and reduce canditates from other cells
		this.solveCandidates();

		// backtracking algorithm
		this.solveRecursive();

		// the puzzle is solved when there are no unassigned cells left
		if (this.getUnassignedCell() !== null) {
			return null;
		}

		// if (!this.checkCells()) {
		// 	return null;
		// }

		// write solution string
		return [...this.cells.values()].map((cell) => cell.value).join('');
	}
}
