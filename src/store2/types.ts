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

export type ChordNames =
    | "maj"
    | "m"
    | "aug"
    | "dim"
    | "sus"
    | "maj7"
    | "min7"
    | "7"
    | "min7b5"
    | "dimbb7"
    | "penta"
    | "Dim Penta"
    | "Major"
    | "Mel min"
    | "Har Maj"
    | "Har Min"
    | "Neo";

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
