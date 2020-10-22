import React, { useEffect, useContext } from "react";
import { Input } from "./input";
import { FretBoard } from "./fretboard";
import { Piano } from "./piano";
import { KeyWheel } from "./keywheel";
import { KeyCube } from "./keycube";
import {
    buildKeyWheel,
    getNotes,
    getEmptySet,
    dup,
    mod,
    onCopyToClipboard,
    nodeFromRoot,
} from "../util";
import {
    EMPTY,
    ROOT_REFERENCES,
    ORDERINGS,
    NOTE_NAMES,
    SHAPES,
} from "../consts";
import { KeyWheelContext } from "../store";

const mainStyle = {
    boxSizing: "border-box",
};

const titleStyle = {
    fontSize: "26px",
    padding: "10px",
};

const buttonStyle = {
    padding: "5px",
    backgroundColor: "#aaa",
    borderRadius: 0,
    margin: "5px",
    textAlign: "center",
    minWidth: "60px",
    height: "30px",
    fontSize: "14px",
};

const navBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderBottom: "2px solid black",
    marginBottom: "20px",
};

const linkContainerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
};

export const App = ({ oldState }) => {
    const { state, dispatch } = useContext(KeyWheelContext);

    useEffect(() => {
        rehydrateState(rebuildKeyWheel);
        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const saveToLocalStorage = () => {
        for (let key in state) {
            if (key !== "scales")
                localStorage.setItem(key, JSON.stringify(state[key]));
        }
    };

    const rehydrateState = (cb) => {
        let newState = {};
        for (let key in state) {
            if (oldState) {
                newState[key] = oldState[key];
            } else if (localStorage.hasOwnProperty(key)) {
                let val = localStorage.getItem(key);
                try {
                    val = JSON.parse(val);
                    newState[key] = val;
                } catch (e) {
                    newState[key] = state[key];
                }
            }
        }

        dispatch({ type: "REHYDRATE", payload: newState });
        cb();
    };

    const onSaveToClipboard = (e) => {
        // save state to URL
        const state = dup(state);
        delete state.scales;

        history.pushState(
            "",
            "KeyWheel",
            `?q=${encodeURIComponent(JSON.stringify(state))}`
        );

        // copy to clipboard
        onCopyToClipboard(window.location.href);
    };

    const calculateChord = (i) => {
        const { noteNames, chordNames } = state;
        const rootIdx = NOTE_NAMES.indexOf(noteNames[i]);
        const pegs = SHAPES[chordNames[i]]
            .map((note) => (note + rootIdx) % 12)
            .sort();
        handleGroup(getNotes(pegs), i);
    };

    const onNameChange = (e, i) => {
        const noteNames = dup(state.noteNames);
        noteNames[i] = e.target.value;

        dispatch({ type: "CHANGE_NAME", payload: noteNames });
        calculateChord(i);
    };

    const onChordChange = (e, i) => {
        const chordNames = dup(state.chordNames);
        chordNames[i] = e.target.value;
        dispatch({ type: "CHANGE_CHORD", payload: chordNames });
        calculateChord(i);
    };

    const handleKeyPress = (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            shiftScale(2);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            shiftScale(-2);
        }
    };

    const rebuildKeyWheel = () => {
        const newStart = nodeFromRoot(state.start);
        const flip = state.start > 6 ? -1 : 1;
        const scales = buildKeyWheel(newStart, flip);
        dispatch({ type: "REBUILD_SCALES", payload: scales });
    };

    const shiftScale = (inc) => {
        const start = mod(state.start + inc, 12);
        dispatch({ type: "SHIFT_SCALE", payload: start });
        rebuildKeyWheel;
    };

    const clearNotes = (i = -1) => {
        if (i >= 0) {
            const selected = dup(state.selected);
            selected[i] = dup(EMPTY);

            dispatch({ type: "SET_SELECTED", payload: selected });
        } else {
            dispatch({ type: "SET_SELECTED", payload: getEmptySet() });
        }
    };

    const handleClick = (i, id) => {
        const selected = [];
        state.selected.forEach((notes) => {
            selected.push(dup(notes));
        });
        selected[id][i] = !selected[id][i];
        dispatch({ type: "SET_SELECTED", payload: selected });
    };

    const handleGroup = (notes, id) => {
        const selected = [];
        state.selected.forEach((notes) => {
            selected.push(dup(notes));
        });
        selected[id] = notes;
        dispatch({ type: "SET_SELECTED", payload: selected });
    };

    const toggleMode = () => {
        const mode = state.mode === "union" ? "intersection" : "union";
        dispatch({ type: "TOGGLE_MODE", payload: mode });
    };

    const changeRef = (e) => {
        dispatch({ type: "CHANGE_ROOT_REF", payload: e.currentTarget.value });
    };

    const changeOrder = (e) => {
        dispatch({ type: "CHANGE_ORDER", payload: e.currentTarget.value });
    };

    const toggleMute = () => {
        const mute = !state.mute;
        dispatch({ type: "TOGGLE_MUTE", payload: mute });
    };

    const { selected, scales, mute, mode, rootReference, ordering } = state;

    if (!scales) return null;

    return (
        <div style={mainStyle}>
            <div style={navBarStyle}>
                <div style={titleStyle}>KeyWheel</div>
                <div style={linkContainerStyle}>
                    <button style={buttonStyle} onClick={onSaveToClipboard}>
                        Save To Clipboard
                    </button>
                    <button style={buttonStyle} onClick={toggleMute}>
                        {state.mute ? "Unmute" : "Mute"}
                    </button>
                    <button style={buttonStyle} onClick={clearNotes}>
                        Clear All
                    </button>
                    <select
                        onChange={changeRef}
                        style={buttonStyle}
                        defaultValue={"numbers"}
                    >
                        {Object.keys(ROOT_REFERENCES).map((key, i) => (
                            <option key={`reference-${i}`} value={key}>
                                Label: {ROOT_REFERENCES[key]}
                            </option>
                        ))}
                    </select>
                    <select
                        onChange={changeOrder}
                        style={buttonStyle}
                        defaultValue={"chromatic"}
                    >
                        {Object.keys(ORDERINGS).map((key, i) => (
                            <option key={`ordering-${i}`} value={key}>
                                {/* {When you return, fix this so the ordering is passed by prop down to Scale} */}
                                {ORDERINGS[key]}
                            </option>
                        ))}
                    </select>
                    <button style={buttonStyle} onClick={toggleMode}>
                        {`Mode: ${
                            state.mode === "union" ? "Union" : "Intersection"
                        }`}
                    </button>
                    <button style={buttonStyle}>
                        <a href="https://github.com/seanjams/keywheel">
                            source
                        </a>
                    </button>
                </div>
            </div>

            <div style={{ margin: "50px auto", width: "fit-content" }}>
                <Input
                    selected={selected}
                    handleClick={handleClick}
                    handleGroup={handleGroup}
                    onNameChange={onNameChange}
                    onChordChange={onChordChange}
                    clearNotes={clearNotes}
                    rootReference={rootReference}
                    mode={mode}
                    mute={mute}
                    ordering={ordering}
                />
            </div>

            <div style={{ margin: "50px auto", width: "fit-content" }}>
                <KeyCube />
            </div>

            <div style={{ margin: "50px auto", width: "fit-content" }}>
                <KeyWheel
                    selected={selected}
                    scales={scales}
                    rootReference={rootReference}
                    mode={mode}
                    mute={mute}
                    ordering={ordering}
                />
            </div>

            <div style={{ margin: "50px auto", width: "fit-content" }}>
                <FretBoard
                    selected={selected}
                    style={{
                        width: "80vw",
                        height: "10vw",
                    }}
                />
            </div>

            <div style={{ margin: "50px auto", width: "fit-content" }}>
                <Piano
                    selected={selected}
                    octaves={3}
                    style={{
                        width: "80vw",
                        height: "10vw",
                    }}
                />
            </div>
        </div>
    );
};
