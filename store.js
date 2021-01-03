import { createContext } from "react";
import { mod, getEmptySet, nodeFromRoot, buildKeyWheel } from "./util";
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
    keyCubeVisible: false,
    keyWheelVisible: true,
};

export const KeyWheelContext = createContext(DEFAULT_STATE);

const keyWheelFromStart = (start) => {
    const startNode = nodeFromRoot(start);
    const flip = start > 6 ? -1 : 1;
    const scaleNodes = buildKeyWheel(startNode, flip);
    return scaleNodes;
};

export const reducer = (state, action) => {
    Object.freeze(state);
    switch (action.type) {
        case "CLEAR":
            return { ...DEFAULT_STATE };
        case "REHYDRATE":
            return {
                ...action.payload,
                scales: keyWheelFromStart(action.payload.start || 0),
            };
        case "CHANGE_NAME":
            return { ...state, noteNames: action.payload };
        case "CHANGE_CHORD":
            return { ...state, chordNames: action.payload };
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
        case "SHIFT_SCALE":
            const start = mod(state.start + action.payload, 12);
            return {
                ...state,
                start,
                scales: keyWheelFromStart(start),
            };
        case "TOGGLE_KEY_CUBE":
            return { ...state, keyCubeVisible: action.payload };
        case "TOGGLE_KEY_WHEEL":
            return { ...state, keyWheelVisible: action.payload };
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
