import {
    ChordNames,
    NoteNames,
    Orderings,
    PositionType,
    RootReferences,
    VertexType,
} from "../types";
import { ScaleNode } from "../util";

export enum SceneKey {
    keyCube = "keyCube",
    chordCube = "chordCube",
}

export enum DisplayType {
    keyCube = "Key Cube",
    chordCube = "Chord Crystal",
    keyWheel = "Key Wheel",
    instruments = "Instruments",
}

export interface SceneType {
    // keyCube / chordCube state props
    edgeSize: number;
    vertices: Record<string, VertexType>;
    connections: [string, string][];
    startingPos: PositionType;
    hiddenNoteNames: NoteNames[];
    hiddenChordNames: ChordNames[];
}

export interface AppStateType {
    start: number;
    selected: boolean[][];
    selectedRootIndices: (NoteNames | undefined)[];
    selectedChordNames: (ChordNames | undefined)[];
    normalizedPolygonPoints: [number, number][][];
    rootReference: RootReferences;
    ordering: Orderings;
    mute: boolean;
    display: DisplayType;
    scales: ScaleNode[];
    // keyCube / chordCube state props
    keyCube: SceneType;
    chordCube: SceneType;
}
