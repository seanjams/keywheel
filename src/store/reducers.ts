import { ChordNames, NoteNames, Orderings, RootReferences } from "../types";
import {
    NOTE_NAMES,
    SHAPES,
    chordCubeExperimentalConstants,
    keyCubeExperimentalConstants,
    buildKeyWheel,
    dup,
    getEmptySet,
    getNotes,
    mod,
    getNormalizedSVGPolygonPoints,
} from "../util";
import { AppStateType, DisplayType, SceneKey } from "./types";

export const DEFAULT_APP_STATE: () => AppStateType = () => {
    return {
        start: 0,
        selected: getEmptySet(),
        normalizedPolygonPoints: Array(8)
            .fill(0)
            .map(() => new Array()),
        rootReference: RootReferences.names,
        ordering: Orderings.chromatic,
        mute: false,
        noteNames: Array(8).fill("C"),
        chordNames: Array(8).fill("Major"),
        display: DisplayType.chordCube,
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
        // appStore.dispatch.showKeyCube(
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
        const { ordering } = state;

        // cache positions of polygon vertices for each input selection
        const normalizedPolygonPoints = getNormalizedSVGPolygonPoints(
            selected,
            ordering,
        );

        return {
            ...state,
            selected,
            normalizedPolygonPoints,
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
        const { selected } = state;

        // cache positions of polygon vertices for each input selection
        const normalizedPolygonPoints = getNormalizedSVGPolygonPoints(
            selected,
            ordering,
        );

        return {
            ...state,
            ordering,
            normalizedPolygonPoints,
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
    changeDisplay(state: AppStateType, display: DisplayType): AppStateType {
        return {
            ...state,
            display,
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
    hideVerticesByType(
        state: AppStateType,
        scene: SceneKey,
        hiddenNoteNames: NoteNames[],
        hiddenChordNames: ChordNames[],
    ): AppStateType {
        const { vertices } = state[scene];
        const newVertices = dup(vertices);

        Object.values(newVertices).forEach((vertex) => {
            const { rootIdx } = vertex;

            if (hiddenChordNames.includes(vertex.scaleType)) {
                vertex.hidden = true;
                return;
            }

            const rootIndicesToHide = [];
            rootIndicesToHide.push(rootIdx);
            if (vertex.scaleType === ChordNames.dim7Chord) {
                rootIndicesToHide.push(mod(rootIdx + 3, 12));
                rootIndicesToHide.push(mod(rootIdx + 6, 12));
                rootIndicesToHide.push(mod(rootIdx + 9, 12));
            } else if (vertex.scaleType === ChordNames.domb5Chord) {
                rootIndicesToHide.push(mod(rootIdx + 6, 12));
            } else if (vertex.scaleType === ChordNames.augChord) {
                // rootIndicesToHide.push(mod(rootIdx + 4, 12));
                // rootIndicesToHide.push(mod(rootIdx + 8, 12));
            }

            if (
                rootIndicesToHide.every((rootIdx) =>
                    hiddenNoteNames.some(
                        (note) => note === NOTE_NAMES[rootIdx],
                    ),
                )
            ) {
                vertex.hidden = true;
                return;
            }

            vertex.hidden = false;
        });

        return {
            ...state,
            [scene]: {
                ...state[scene],
                vertices: newVertices,
            },
        };
    },
    hideVertex(
        state: AppStateType,
        scene: SceneKey,
        vertexKey: string,
        shouldHide: boolean,
    ): AppStateType {
        const { vertices } = state[scene];
        const vertex = dup(vertices[vertexKey]);

        if (vertex) {
            vertex.hidden = shouldHide;
        }

        return {
            ...state,
            [scene]: {
                ...state[scene],
                vertices: {
                    ...state[scene].vertices,
                    [vertexKey]: vertex,
                },
            },
        };
    },
};
