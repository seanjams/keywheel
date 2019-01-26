// SCALE_RADIUS + NOTE_RADIUS === 50
export const SCALE_RADIUS = 40;

export const NOTE_RADIUS = 10;

export const DIRS = ["TL", "TR", "BL", "BR"];

export const ROOT_REFERENCES = {
	numbers: "Numbers",
	degrees: "Scale Degrees",
	names: "Note Names",
};

export const ORDERINGS = {
	chromatic: "Chromatic",
	fifths: "Fifths",
};

export const C = [
	true,
	false,
	true,
	false,
	true,
	true,
	false,
	true,
	false,
	true,
	false,
	true,
];

export const EMPTY = [
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
];

export const NOTE_NAMES = [
	"C",
	"Db",
	"D",
	"Eb",
	"E",
	"F",
	"Gb",
	"G",
	"Ab",
	"A",
	"Bb",
	"B",
];

export const MAJOR = [2, 2, 1, 2, 2, 2, 1];
export const MELMINOR = [2, 1, 2, 2, 2, 2, 1];
export const NEAPOLITAN = [1, 2, 2, 2, 2, 2, 1];
export const SHAPES = {
	major: [0, 4, 7],
	minor: [0, 3, 7],
	major7: [0, 4, 7, 11],
	minor7: [0, 3, 7, 10],
	major9: [0, 2, 4, 7],
	aug: [0, 4, 8],
	dom: [0, 4, 10],
	dom5: [0, 4, 7, 10],
	dom9: [0, 2, 4, 10],
	dim: [0, 3, 6],
	dimbb7: [0, 3, 6, 9],
	dimb7: [0, 3, 6, 10],
	sus: [0, 2, 7],
	penta: [0, 2, 4, 7, 9],
	dimPenta: [0, 3, 6, 8, 10],
	Maj: [0, 2, 4, 5, 7, 9, 11],
	Melmin: [0, 2, 3, 5, 7, 9, 11],
	Neo: [0, 1, 3, 5, 7, 9, 11],
};
