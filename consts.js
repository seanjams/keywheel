// SCALE_RADIUS + NOTE_RADIUS === 50
export const SCALE_RADIUS = 41;

export const NOTE_RADIUS = 9;

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
    "D♭",
    "D",
    "E♭",
    "E",
    "F",
    "G♭",
    "G",
    "A♭",
    "A",
    "B♭",
    "B",
];

export const SHARP_NOTE_NAMES = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
];

export const MAJOR = [2, 2, 1, 2, 2, 2, 1];
export const MELMINOR = [2, 1, 2, 2, 2, 2, 1];
export const HARMAJOR = [2, 2, 1, 2, 1, 3, 1];
export const HARMINOR = [2, 1, 2, 2, 1, 3, 1];
export const NEAPOLITAN = [1, 2, 2, 2, 2, 2, 1];

export const majorChord = "maj";
export const minorChord = "m";
export const augChord = "aug";
export const dimChord = "dim";
export const susChord = "sus";
export const maj7Chord = "maj7";
export const min7Chord = "min7";
export const domChord = "7";
export const min7b5Chord = "min7b5";
export const dim7Chord = "dimbb7";
export const pentaScale = "penta";
export const dimPentaScale = "Dim Penta";
export const majorScale = "Major";
export const melMinScale = "Mel min";
export const harMajScale = "Har Maj";
export const harMinScale = "Har Min";
export const NeoScale = "Neo";

export const CHORD_NAMES = [
    majorChord,
    minorChord,
    augChord,
    dimChord,
    susChord,
    maj7Chord,
    min7Chord,
    domChord,
    min7b5Chord,
    dim7Chord,
    pentaScale,
    dimPentaScale,
    majorScale,
    melMinScale,
    harMajScale,
    harMinScale,
    NeoScale,
];

export const SHAPES = {
    [majorChord]: [0, 4, 7],
    [minorChord]: [0, 3, 7],
    [augChord]: [0, 4, 8],
    [dimChord]: [0, 3, 6],
    [susChord]: [0, 2, 7],
    [maj7Chord]: [0, 4, 7, 11],
    [min7Chord]: [0, 3, 7, 10],
    [domChord]: [0, 4, 7, 10],
    [min7b5Chord]: [0, 3, 6, 10],
    [dim7Chord]: [0, 3, 6, 9],
    [pentaScale]: [0, 2, 4, 7, 9],
    [dimPentaScale]: [0, 3, 6, 8, 10],
    [majorScale]: [0, 2, 4, 5, 7, 9, 11],
    [melMinScale]: [0, 2, 3, 5, 7, 9, 11],
    [harMajScale]: [0, 2, 4, 5, 7, 8, 11],
    [harMinScale]: [0, 2, 3, 5, 7, 8, 11],
    [NeoScale]: [0, 1, 3, 5, 7, 9, 11],
};

// Key Cube Experimental Constants
const PATTERN_MAP = {
    [majorScale]: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
    ],
    [melMinScale]: [
        [-1, 0, 0],
        [0, 1, -1],
        [1, 0, 0],
    ],

    [harMinScale]: [
        [-1, -1, 0],
        [-1, 1, -1],
        [1, 0, -1],
    ],

    [harMajScale]: [
        [0, -1, 0],
        [-1, 1, 0],
        [1, 1, -1],
    ],
};

export const CUBE_RANGE = [-2, -1, 0, 1];
export const CUBE_SIZE = 150;
export const CUBE_POSITIONS = [];
export const VERTICES = {};
export const STARTING_POS = [CUBE_SIZE * -30, CUBE_SIZE * 10, CUBE_SIZE * 20];

for (let i in NOTE_NAMES) {
    // traverse in circle of fifths
    // get positions for every scale vertex and the cube positions for them
    const root = NOTE_NAMES[(7 * i) % 12];
    const patternIndex = i % 3;
    const patternDelta = Math.floor(i / 3);

    for (let name of [majorScale, melMinScale, harMinScale, harMajScale]) {
        const coordinates = PATTERN_MAP[name][patternIndex];
        const cubePositions = CUBE_RANGE.map((i, index) => {
            const key = `${root}-${name}-${index}`;
            const position = coordinates.map((coord, j) => {
                return (4 * i + (coord + patternDelta)) * CUBE_SIZE;
            });

            VERTICES[key] = {
                key,
                label: `${root}\n${name}`,
                root,
                scaleType: name,
                position,
            };
            return position;
        });

        if (i % 3 === 0 && name !== harMajScale) {
            CUBE_POSITIONS.push(...cubePositions);
        }
    }
}
