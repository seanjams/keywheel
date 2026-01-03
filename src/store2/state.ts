import { COLORS, lightGrey, mediumGrey } from "../colors";
import { NOTE_NAMES, SHAPES, VERTICES } from "../consts";
import {
    buildKeyWheel,
    DEFAULT_NOTE_COLOR_OPTIONS,
    getEmptySet,
    getNotes,
    getPegs,
    mod,
    ScaleNode,
} from "../util";
import { Store } from "./store";
import {
    ChordNames,
    Mode,
    NoteNames,
    Orderings,
    RootReferences,
} from "./types";

// Types
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

export const DEFAULT_APP_STATE: () => AppStateType = () => {
    return {
        start: 0,
        selected: getEmptySet(),
        mode: "union",
        rootReference: "names",
        ordering: "chromatic",
        mute: false,
        noteNames: Array(8).fill("C"),
        chordNames: Array(8).fill("Major"),
        keyCubeVisible: true,
        keyWheelVisible: false,
        instrumentsVisible: false,
        scales: [],
        threeProps: buildThreeProps(getEmptySet()),
        layoutDisabledKeys: {},
    };
};

// builds object with key pointing to textGeometry props for specific vertix
function buildThreeProps(selected: boolean[][]): {
    [key in string]: string[][];
} {
    function getNoteColors(root: NoteNames, scaleType: ChordNames) {
        const rootIdx = NOTE_NAMES.indexOf(root);
        if (rootIdx === -1) return DEFAULT_NOTE_COLOR_OPTIONS;

        const scaleNotes = getNotes(
            SHAPES[scaleType].map((note) => (note + rootIdx) % 12).sort(),
        );

        const noteColors = scaleNotes.map((note) =>
            note ? [mediumGrey] : [lightGrey],
        );

        for (let i = selected.length - 1; i >= 0; i--) {
            const selectedPegs = getPegs(selected[i]);
            if (
                selectedPegs.length &&
                selectedPegs.every((val) => scaleNotes[val])
            ) {
                for (let peg of selectedPegs) {
                    noteColors[peg].push(COLORS(1)[i]);
                }
            }
        }

        return noteColors;
    }

    const nextThreeProps: { [key in string]: string[][] } = {};
    for (let key in VERTICES) {
        let { root, scaleType } = VERTICES[key];
        nextThreeProps[key] = getNoteColors(root, scaleType);
    }

    return nextThreeProps;
}

// Reducers
export const reducers = {
    clear(state: AppStateType): AppStateType {
        return {
            ...DEFAULT_APP_STATE(),
        };
    },
    rehydrate(state: AppStateType): AppStateType {
        console.log("rehydrate needs some TLC");
        // let stateFromUrl = JSON.parse(
        //     decodeURIComponent(window.location.search.slice(3)),
        // );

        // const newState = { ...state };
        // if ("start" in stateFromUrl && typeof stateFromUrl.start === "number")
        // let newState: Partial<AppStateType> = {};

        // if (typeof stateFromUrl.start == "number") {
        // newState.start = stateFromUrl.start;
        // }

        // Object.keys(state).forEach((key: keyof AppStateType) => {
        //     if (
        //         stateFromUrl &&
        //         key in stateFromUrl &&
        //         stateFromUrl[key] !== undefined &&
        //         stateFromUrl[key] !== null
        //     ) {
        //         newState[key] = stateFromUrl[key];
        //     } else if (localStorage.hasOwnProperty(key)) {
        //         let val = localStorage.getItem(key);
        //         try {
        //             val = val !== null && JSON.parse(val);
        //             newState[key] = val;
        //         } catch (e) {
        //             newState[key] = state[key];
        //         }
        //     } else {
        //         newState[key] = state[key];
        //     }
        // });

        // appStore.dispatch.rehydrate(newState);
        // appStore.dispatch.setSelected(newState.selected || getEmptySet());
        // appStore.dispatch.toggleKeyCube(
        //     !newState.keyWheelVisible && !newState.instrumentsVisible,
        // );

        return {
            ...state,
            // ...payload,
            // scales: buildKeyWheel(payload.start || 0),
            scales: buildKeyWheel(0),
        };
    },
    changeName(state: AppStateType, noteNames: NoteNames[]): AppStateType {
        return {
            ...state,
            noteNames,
        };
    },
    changeChord(state: AppStateType, chordNames: ChordNames[]): AppStateType {
        return {
            ...state,
            chordNames,
        };
    },
    setSelected(state: AppStateType, selected: boolean[][]): AppStateType {
        const threeProps = buildThreeProps(selected);
        return {
            ...state,
            selected,
            threeProps,
        };
    },
    toggleMode(state: AppStateType, mode: Mode): AppStateType {
        return {
            ...state,
            mode,
        };
    },
    changeRootReference(
        state: AppStateType,
        rootReference: RootReferences,
    ): AppStateType {
        return {
            ...state,
            rootReference,
        };
    },
    changeOrder(state: AppStateType, ordering: Orderings): AppStateType {
        return {
            ...state,
            ordering,
        };
    },
    toggleMute(state: AppStateType, mute: boolean): AppStateType {
        return {
            ...state,
            mute,
        };
    },
    shiftScale(state: AppStateType, offset: number): AppStateType {
        const start = mod(state.start + offset, 12);
        return {
            ...state,
            start,
            scales: buildKeyWheel(start),
        };
    },
    toggleKeyCube(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: false,
            keyWheelVisible: false,
            keyCubeVisible: true,
        };
    },
    toggleKeyWheel(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: false,
            keyWheelVisible: true,
            keyCubeVisible: false,
        };
    },
    toggleInstruments(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: true,
            keyWheelVisible: false,
            keyCubeVisible: false,
        };
    },
    saveToLocalStorage(state: AppStateType): AppStateType {
        for (let key in state) {
            if (key !== "scales")
                localStorage.setItem(
                    key,
                    JSON.stringify(state[key as keyof AppStateType]),
                );
        }
        return {
            ...state,
        };
    },
    setThreeProps(
        state: AppStateType,
        threeProps: { [x: string]: string[][] },
    ) {
        return {
            ...state,
            threeProps,
        };
    },
    setLayoutDisabledKey(
        state: AppStateType,
        layoutKey: string,
        layoutDisabled: boolean,
    ) {
        return {
            ...state,
            layoutDisabledKeys: {
                ...state.layoutDisabledKeys,
                [layoutKey]: layoutDisabled,
            },
        };
    },
};

// Store
export class AppStore extends Store<AppStateType, typeof reducers> {
    constructor() {
        super(DEFAULT_APP_STATE(), reducers);
    }
}
