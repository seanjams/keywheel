export const SCALE_SPACING = () => window.innerWidth / 20;

export const SCALE_RADIUS = () => window.innerWidth / 40;

export const NOTE_RADIUS = () => window.innerWidth * 3 / 290;

export const NUM_LABEL_SIZE = () =>
	parseFloat((window.innerWidth / 2048).toFixed(1));

export const TEXT_LABEL_SIZE = () =>
	parseInt((window.innerWidth / 120).toFixed(0));

export const INPUT_NOTE_RADIUS = 16;

export const INPUT_SCALE_RADIUS = 40;

export const WHEEL_CENTER = () => ({
	x: 6 * window.innerWidth / 20,
	y: 4 * window.innerWidth / 20,
});

export const DIRS = ["TL", "TR", "BL", "BR"];

export const CMAJOR = [
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
export const SHAPE = {
	major: [0, 4, 7],
	minor: [0, 3, 7],
	major7: [0, 4, 7, 11],
	minor7: [0, 3, 7, 10],
	aug: [0, 4, 8],
	dom: [0, 4, 10],
	dom5: [0, 4, 7, 10],
	dom9: [0, 2, 4, 10],
	dim: [0, 3, 6],
	dimbb7: [0, 3, 6, 9],
	dimb7: [0, 3, 6, 10],
	sus2: [0, 2, 7],
	sus4: [0, 5, 7],
	penta: [0, 2, 4, 7, 9],
	dimPenta: [0, 3, 6, 8, 10],
};

const getX = i => {
	return (4 * i + 35) * window.innerWidth / 50;
};

const getY = i => {
	return [3 * window.innerWidth / 20, 6 * window.innerWidth / 20][i];
};

export const getInputNodes = () => [
	{
		notes: [...EMPTY],
		center: {
			x: getX(0),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(1),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(2),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(3),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(0),
			y: getY(1),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(1),
			y: getY(1),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(2),
			y: getY(1),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(3),
			y: getY(1),
		},
	},
];
