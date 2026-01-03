export type Dirs = "TL" | "TR" | "BL" | "BR";

export type Mode = "union" | "intersection";

export type RootReferences = "numbers" | "degrees" | "names";

export type Orderings = "chromatic" | "fifths";

export type NoteNames =
    | "C"
    | "D♭"
    | "D"
    | "E♭"
    | "E"
    | "F"
    | "G♭"
    | "G"
    | "A♭"
    | "A"
    | "B♭"
    | "B";

export type SharpNoteNames =
    | "C"
    | "C♯"
    | "D"
    | "D♯"
    | "E"
    | "F"
    | "F♯"
    | "G"
    | "G♯"
    | "A"
    | "A♯"
    | "B";

export enum ChordNames {
    majorChord = "maj",
    minorChord = "m",
    augChord = "aug",
    dimChord = "dim",
    susChord = "sus",
    maj7Chord = "maj7",
    min7Chord = "min7",
    domChord = "7",
    min7b5Chord = "min7♭5",
    dim7Chord = "dimbb7",
    minMajChord = "minmaj7",
    majAugChord = "maj7♯5",
    domb5Chord = "7♭5",
    domAugChord = "7♯5",
    pentaScale = "penta",
    dimPentaScale = "Dim Penta",
    majorScale = "Major",
    melMinScale = "Mel min",
    harMajScale = "Har Maj",
    harMinScale = "Har Min",
    NeoScale = "Neo",
}

export type ReactChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type ReactMouseEvent =
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>;
export type WindowMouseEvent = MouseEvent | TouchEvent;

export type TweekType = {
    notes: boolean[];
    tweekStatus: number;
    center?: { x: number; y: number };
};

export type PositionType = [number, number, number];

export type VertexType = {
    key: string;
    label: string;
    root: NoteNames;
    scaleType: ChordNames;
    position: PositionType;
};
