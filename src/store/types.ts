import {
    ChordNames,
    Mode,
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

export interface SceneType {
    // keyCube / chordCube state props
    edgeSize: number;
    vertices: Record<string, VertexType>;
    connections: [string, string][];
    startingPos: PositionType;
}

export interface AppStateType {
    start: number;
    selected: boolean[][];
    mode: Mode;
    rootReference: RootReferences;
    ordering: Orderings;
    mute: boolean;
    noteNames: NoteNames[];
    chordNames: ChordNames[];
    chordCubeVisible: boolean;
    keyCubeVisible: boolean;
    keyWheelVisible: boolean;
    instrumentsVisible: boolean;
    scales: ScaleNode[];
    // keyCube / chordCube state props
    keyCube: SceneType;
    chordCube: SceneType;
}

export type ChordCubeNames =
    | ChordNames.maj7Chord
    | ChordNames.min7Chord
    | ChordNames.domChord
    | ChordNames.min7b5Chord
    | ChordNames.minMajChord
    | ChordNames.majAugChord
    | ChordNames.domAugChord
    | ChordNames.domb5Chord
    | ChordNames.dim7Chord
    | ChordNames.augChord;
