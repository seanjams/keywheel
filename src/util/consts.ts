import {
    ChordNames,
    Dirs,
    NoteNames,
    Orderings,
    RootReferences,
    SharpNoteNames,
} from "../types";

// SCALE_RADIUS + NOTE_RADIUS === 50
export const SCALE_RADIUS = 41;

export const NOTE_RADIUS = 9;

export const SVG_OPACITY = 0.5;

export const DIRS: Dirs[] = ["TL", "TR", "BL", "BR"];

export const ROOT_REFERENCES: Record<RootReferences, string> = {
    names: "Note Names",
    numbers: "Numbers",
    degrees: "Scale Degrees",
};

export const ORDERINGS: Record<Orderings, string> = {
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

export const NOTE_NAMES: NoteNames[] = [
    NoteNames.C,
    NoteNames.Db,
    NoteNames.D,
    NoteNames.Eb,
    NoteNames.E,
    NoteNames.F,
    NoteNames.Gb,
    NoteNames.G,
    NoteNames.Ab,
    NoteNames.A,
    NoteNames.Bb,
    NoteNames.B,
];

export const SHARP_NOTE_NAMES: SharpNoteNames[] = [
    SharpNoteNames.C,
    SharpNoteNames.Cs,
    SharpNoteNames.D,
    SharpNoteNames.Ds,
    SharpNoteNames.E,
    SharpNoteNames.F,
    SharpNoteNames.Fs,
    SharpNoteNames.G,
    SharpNoteNames.Gs,
    SharpNoteNames.A,
    SharpNoteNames.As,
    SharpNoteNames.B,
];

export const MAJOR = [2, 2, 1, 2, 2, 2, 1];
export const MELMINOR = [2, 1, 2, 2, 2, 2, 1];
export const HARMAJOR = [2, 2, 1, 2, 1, 3, 1];
export const HARMINOR = [2, 1, 2, 2, 1, 3, 1];
export const NEAPOLITAN = [1, 2, 2, 2, 2, 2, 1];

export const SHAPES: Record<ChordNames, number[]> = {
    [ChordNames.majorChord]: [0, 4, 7],
    [ChordNames.minorChord]: [0, 3, 7],
    [ChordNames.augChord]: [0, 4, 8],
    [ChordNames.dimChord]: [0, 3, 6],
    [ChordNames.susChord]: [0, 2, 7],
    [ChordNames.maj7Chord]: [0, 4, 7, 11],
    [ChordNames.min7Chord]: [0, 3, 7, 10],
    [ChordNames.domChord]: [0, 4, 7, 10],
    [ChordNames.min7b5Chord]: [0, 3, 6, 10],
    [ChordNames.dim7Chord]: [0, 3, 6, 9],
    [ChordNames.minMajChord]: [0, 3, 7, 11],
    [ChordNames.majb5Chord]: [0, 4, 6, 11],
    [ChordNames.majAugChord]: [0, 4, 8, 11],
    [ChordNames.majSusChord]: [0, 5, 7, 11],
    [ChordNames.domb5Chord]: [0, 4, 6, 10],
    [ChordNames.domAugChord]: [0, 4, 8, 10],
    [ChordNames.domSusChord]: [0, 5, 7, 10],
    [ChordNames.pentaScale]: [0, 2, 4, 7, 9],
    [ChordNames.dimPentaScale]: [0, 3, 6, 8, 10],
    [ChordNames.majorScale]: [0, 2, 4, 5, 7, 9, 11],
    [ChordNames.melMinScale]: [0, 2, 3, 5, 7, 9, 11],
    [ChordNames.harMajScale]: [0, 2, 4, 5, 7, 8, 11],
    [ChordNames.harMinScale]: [0, 2, 3, 5, 7, 8, 11],
    [ChordNames.NeoScale]: [0, 1, 3, 5, 7, 9, 11],
};
