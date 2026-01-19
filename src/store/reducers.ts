import {
    chordCubeExperimentalConstants,
    keyCubeExperimentalConstants,
    NOTE_NAMES,
    SHAPES,
} from "../consts";
import {
    ChordNames,
    NoteNames,
    Mode,
    Orderings,
    RootReferences,
} from "../types";
import { buildKeyWheel, dup, getEmptySet, getNotes, mod } from "../util";
import { AppStateType, SceneKey } from "./types";

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
        chordCubeVisible: true,
        keyCubeVisible: false,
        keyWheelVisible: false,
        instrumentsVisible: false,
        scales: [],
        // keyCube / chordCube
        keyCube: {
            edgeSize: 150,
            vertices: {},
            connections: [],
            startingPos: [0, 0, 0],
        },
        chordCube: {
            edgeSize: 150,
            vertices: {},
            connections: [],
            startingPos: [0, 0, 0],
        },
    };
};

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
    changeName(
        state: AppStateType,
        noteName: NoteNames,
        index: number,
    ): AppStateType {
        // TODO: clicking on the Input scales to change selected notes after changing name in
        //  dropdown doesn't clear dropdowns, fix this
        const { noteNames, chordNames, selected } = state;
        const newNoteNames = dup(noteNames);
        newNoteNames[index] = noteName;

        const rootIdx = NOTE_NAMES.indexOf(newNoteNames[index]);
        const pegs = SHAPES[chordNames[index]]
            .map((note) => mod(note + rootIdx, 12))
            .sort();

        const newSelected = dup(selected);
        newSelected[index] = getNotes(pegs);

        return {
            ...this.setSelected(state, newSelected),
            noteNames: newNoteNames,
        };
    },
    changeChord(
        state: AppStateType,
        chordName: ChordNames,
        index: number,
    ): AppStateType {
        // TODO: clicking on the Input scales after changing chord in
        //  dropdown doesn't clear input, fix this
        const { noteNames, chordNames, selected } = state;
        const newChordNames = dup(chordNames);
        newChordNames[index] = chordName;

        const rootIdx = NOTE_NAMES.indexOf(noteNames[index]);
        const pegs = SHAPES[newChordNames[index]]
            .map((note) => mod(note + rootIdx, 12))
            .sort();

        const newSelected = dup(selected);
        newSelected[index] = getNotes(pegs);

        return {
            ...this.setSelected(state, newSelected),
            chordNames: newChordNames,
        };
    },
    setSelected(state: AppStateType, selected: boolean[][]): AppStateType {
        return {
            ...state,
            selected,
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
    toggleChordCube(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: false,
            keyWheelVisible: false,
            keyCubeVisible: false,
            chordCubeVisible: true,
        };
    },
    toggleKeyCube(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: false,
            keyWheelVisible: false,
            keyCubeVisible: true,
            chordCubeVisible: false,
        };
    },
    toggleKeyWheel(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: false,
            keyWheelVisible: true,
            keyCubeVisible: false,
            chordCubeVisible: false,
        };
    },
    toggleInstruments(state: AppStateType): AppStateType {
        return {
            ...state,
            instrumentsVisible: true,
            keyWheelVisible: false,
            keyCubeVisible: false,
            chordCubeVisible: false,
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
    initThreeProps(state: AppStateType): AppStateType {
        const { keyCube, chordCube } = state;
        const {
            startingPos: keyCubeStartingPos,
            vertices: keyCubeVertices,
            connections: keyCubeConnections,
        } = keyCubeExperimentalConstants(keyCube.edgeSize);
        const {
            vertices: chordCubeVertices,
            startingPos: chordCubeStartingPos,
            connections: chordCubeConnections,
        } = chordCubeExperimentalConstants(chordCube.edgeSize);
        return {
            ...state,
            keyCube: {
                ...keyCube,
                startingPos: keyCubeStartingPos,
                vertices: keyCubeVertices,
                connections: keyCubeConnections,
            },
            chordCube: {
                ...chordCube,
                vertices: chordCubeVertices,
                startingPos: chordCubeStartingPos,
                connections: chordCubeConnections,
            },
        };
    },
    hideVertices(
        state: AppStateType,
        scene: SceneKey,
        chordName: ChordNames,
        hide: boolean,
    ): AppStateType {
        const { vertices } = state[scene];
        const newVertices = dup(vertices);
        Object.values(newVertices).map((vertex) => {
            if (vertex.scaleType === chordName) vertex.hidden = hide;
        });
        return {
            ...state,
            [scene]: {
                ...state[scene],
                vertices: newVertices,
            },
        };
    },
};
