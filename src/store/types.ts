import {
    ChordNames,
    Mode,
    NoteNames,
    Orderings,
    RootReferences,
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
    keyCubeVisible: boolean;
    keyWheelVisible: boolean;
    instrumentsVisible: boolean;
    scales: ScaleNode[];
    threeProps: {
        [x: string]: string[][];
    };
    layoutDisabledKeys: { [x: string]: boolean };
}
