import { createContext } from "react";
import { mod, getEmptySet, buildKeyWheel } from "./util";
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
    keyWheelVisible: false,
    instrumentsVisible: false,
};

export const KeyWheelContext = createContext(DEFAULT_STATE);

export const [useStore, api] = create((set) => {
    return { keyCubeVisible: true, set };
});

export const reducer = (state, action) => {
    Object.freeze(state);
    switch (action.type) {
        case "CLEAR":
            return { ...DEFAULT_STATE };
        case "REHYDRATE":
            return {
                ...action.payload,
                scales: buildKeyWheel(action.payload.start || 0),
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
                scales: buildKeyWheel(start),
            };
        case "TOGGLE_KEY_CUBE":
            return { ...state, keyCubeVisible: action.payload };
        case "TOGGLE_KEY_WHEEL":
            return { ...state, keyWheelVisible: action.payload };
        case "TOGGLE_INSTRUMENTS":
            return { ...state, instrumentsVisible: action.payload };
        case "SAVE_TO_LOCAL_STORAGE":
            for (let key in state) {
                if (key !== "scales")
                    localStorage.setItem(key, JSON.stringify(state[key]));
            }
        default:
            return state;
    }
};
