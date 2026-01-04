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
    keyCubeThreeProps: Record<string, string[][]>;
    chordCubeThreeProps: Record<string, string[][]>;
    layoutDisabledKeys: Record<string, boolean>;
    edgeSize: number;
    keyCubeVertices: Record<string, VertexType>;
    keyCubeConnections: [string, string][];
    keyCubeStartingPos: PositionType;
    chordCubeVertices: Record<string, VertexType>;
    chordCubeStartingPos: PositionType;
    chordCubeConnections: [string, string][];
}
