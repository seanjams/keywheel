export type Dirs = "TL" | "TR" | "BL" | "BR";

export type Mode = "union" | "intersection";

export type RootReferences = "numbers" | "degrees" | "names";

export type Orderings = "chromatic" | "fifths";

export enum NoteNames {
    C = "C",
    Db = "D♭",
    D = "D",
    Eb = "E♭",
    E = "E",
    F = "F",
    Gb = "G♭",
    G = "G",
    Ab = "A♭",
    A = "A",
    Bb = "B♭",
    B = "B",
}

export enum SharpNoteNames {
    C = "C",
    Cs = "C♯",
    D = "D",
    Ds = "D♯",
    E = "E",
    F = "F",
    Fs = "F♯",
    G = "G",
    Gs = "G♯",
    A = "A",
    As = "A♯",
    B = "B",
}

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
    key: string; // unique key for vertex
    alternativeKeys: string[]; // other vertex keys which are enharmonic to this one
    label: string; // verbose name
    layerIdx: number; // int to differentiate repeated notes along a lattice
    rootIdx: number; // 0-11, corresponds to note name
    root: NoteNames; // note name for rootIdx
    scaleType: ChordNames; // scale or chord represented at vertex
    position: PositionType; // position of vertex [x, y, z]
    hidden: boolean; // is this vertex visible
};
