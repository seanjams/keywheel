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
export const MajorScale = "Major";
export const MelminScale = "Mel min";
export const HarmajScale = "Har Maj";
export const HarminScale = "Har Min";
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
    MajorScale,
    MelminScale,
    HarmajScale,
    HarminScale,
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
    [MajorScale]: [0, 2, 4, 5, 7, 9, 11],
    [MelminScale]: [0, 2, 3, 5, 7, 9, 11],
    [HarmajScale]: [0, 2, 4, 5, 7, 8, 11],
    [HarminScale]: [0, 2, 3, 5, 7, 8, 11],
    [NeoScale]: [0, 1, 3, 5, 7, 9, 11],
};

// Key Cube Experimental

const POSITIONS = {
    // Major
    [`C ${MajorScale}`]: [0, 0, 0],
    [`G ${MajorScale}`]: [0, 1, 0],
    [`D ${MajorScale}`]: [1, 1, 0],

    [`A ${MajorScale}`]: [1, 1, 1],
    [`E ${MajorScale}`]: [1, 2, 1],
    [`B ${MajorScale}`]: [2, 2, 1],

    [`Gb ${MajorScale}`]: [2, 2, 2],
    [`Db ${MajorScale}`]: [2, 3, 2],
    [`Ab ${MajorScale}`]: [3, 3, 2],

    [`Eb ${MajorScale}`]: [3, 3, 3],
    [`Bb ${MajorScale}`]: [3, 4, 3],
    [`F ${MajorScale}`]: [4, 4, 3],
    // Melminor
    [`C ${MelminScale}`]: [-1, 0, 0],
    [`G ${MelminScale}`]: [0, 1, -1],
    [`D ${MelminScale}`]: [1, 0, 0],

    [`A ${MelminScale}`]: [0, 1, 1],
    [`E ${MelminScale}`]: [1, 2, 0],
    [`B ${MelminScale}`]: [2, 1, 1],

    [`Gb ${MelminScale}`]: [1, 2, 2],
    [`Db ${MelminScale}`]: [2, 3, 1],
    [`Ab ${MelminScale}`]: [3, 2, 2],

    [`Eb ${MelminScale}`]: [2, 3, 3],
    [`Bb ${MelminScale}`]: [3, 4, 2],
    [`F ${MelminScale}`]: [4, 3, 3],
    // Harminor
    [`C ${HarminScale}`]: [-1, -1, 0],
    [`G ${HarminScale}`]: [-1, 1, -1],
    [`D ${HarminScale}`]: [1, 0, -1],

    [`A ${HarminScale}`]: [0, 0, 1],
    [`E ${HarminScale}`]: [0, 2, 0],
    [`B ${HarminScale}`]: [2, 1, 0],

    [`Gb ${HarminScale}`]: [1, 1, 2],
    [`Db ${HarminScale}`]: [1, 3, 1],
    [`Ab ${HarminScale}`]: [3, 2, 1],

    [`Eb ${HarminScale}`]: [2, 2, 3],
    [`Bb ${HarminScale}`]: [2, 4, 2],
    [`F ${HarminScale}`]: [4, 3, 2],
    // Harmajor
    [`C ${HarmajScale}`]: [0, -1, 0],
    [`G ${HarmajScale}`]: [-1, 1, 0],
    [`D ${HarmajScale}`]: [1, 1, -1],

    [`A ${HarmajScale}`]: [1, 0, 1],
    [`E ${HarmajScale}`]: [0, 2, 1],
    [`B ${HarmajScale}`]: [2, 2, 0],

    [`Gb ${HarmajScale}`]: [2, 1, 2],
    [`Db ${HarmajScale}`]: [1, 3, 2],
    [`Ab ${HarmajScale}`]: [3, 3, 1],

    [`Eb ${HarmajScale}`]: [3, 2, 3],
    [`Bb ${HarmajScale}`]: [2, 4, 3],
    [`F ${HarmajScale}`]: [4, 4, 2],
};

export const CUBE_ORIGIN = [0, 0, 0];
export const CUBE_SIZE = 150;

const x = CUBE_ORIGIN[0];
const y = CUBE_ORIGIN[1];
const z = CUBE_ORIGIN[2];

//refactor, builds negative and positive branch of keycube centered at C
export const CUBE_POSITIONS = {};
for (let i = -1; i <= 0; i++) {
    Object.keys(POSITIONS).forEach((noteName) => {
        if (!CUBE_POSITIONS[noteName]) CUBE_POSITIONS[noteName] = [];
        CUBE_POSITIONS[noteName].push(
            POSITIONS[noteName].map((coord) => (4 * i + coord) * CUBE_SIZE)
        );
    });
}
