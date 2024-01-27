const VALS = '123456789'.split('');
const ROWS = 'abcdefghi';

export default class SudokuCell {
	static value2number(value) {
		return value === '.' ? 0 : parseInt(value, 10);
	}

	static index2vert(index) {
		return [index % 9, Math.floor(index / 9)];
	}

	static index2coord(index) {
		const [x, y] = this.index2vert(index);
		return this.vert2coord(x, y);
	}

	static coord2vert(coordinate) {
		const x = coordinate[1] - 1;
		const y = ROWS.indexOf(coordinate[0].toLowerCase());
		return [x, y];
	}

	static vert2coord(x, y) {
		const row = ROWS[y].toUpperCase();
		const col = x + 1;
		return `${row}${col}`;
	}

	constructor(coord, value) {
		this.coord = coord;
		this.value = value;
		this.candidates = [];
	}

	hasValue() {
		return this.value !== '.';
	}

	setValue(value) {
		this.value = value;
	}

	clearValue() {
		this.value = '.';
	}

	setCandidateAsValue() {
		if (this.candidates.length > 1) throw new Error('Illegal operation');
		this.value = this.candidates.pop();
	}

	createCandidates(cells) {
		const values = new Set(
			cells
				.filter((cell) => cell.hasValue())
				.map((cell) => cell.value)
				.sort((a, b) => a - b)
		);

		// create candidates
		this.candidates = [...VALS].filter((value) => !values.has(value));
	}

	removeCandidate(value) {
		const index = this.candidates.indexOf(value);

		if (index < 0) return;

		this.candidates.splice(index, 1);
		// console.log(
		// 	`${this.coord} removed ${value}. Candidates left: ${this.candidates}`
		// );
	}
}
