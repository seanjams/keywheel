import { createContext } from "react";
import { getEmptySet } from "./util";
import create from "zustand";

export const DEFAULT_STATE = {
    start: 0,
    selected: getEmptySet(),
    mode: "union",
    rootReference: "names",
    ordering: "chromatic",
    mute: false,
    noteNames: Array(8).fill("C"),
    chordNames: Array(8).fill("Major"),
};

export const KeyWheelContext = createContext(DEFAULT_STATE);

export const reducer = (state, action) => {
    Object.freeze(state);
    switch (action.type) {
        case "CLEAR":
            return { ...DEFAULT_STATE };
        case "REHYDRATE":
            return { ...action.payload };
        case "CHANGE_NAME":
            return { ...state, noteNames: action.payload };
        case "CHANGE_CHORD":
            return { ...state, chordNames: action.payload };
        case "SHIFT_SCALE":
            return { ...state, start: action.payload };
        case "SET_SELECTED":
            return { ...state, selected: action.payload };
        case "TOGGLE_MODE":
            return { ...state, mode: action.payload };
        case "CHANGE_ROOT_REF":
            return { ...state, rootReference: action.payload };
        case "CHANGE_ORDER":
            return { ...state, ordering: action.payload };
        case "TOGGLE_MUTE":
            return { ...state, mute: action.payload };
        case "REBUILD_SCALES":
            return { ...state, scales: action.payload };
        default:
            return state;
    }
};

export const useStore = create((set) => {
    return {
        textProps: {},
        setTextProps: (textProps) => set({ textProps }),
    };
});
