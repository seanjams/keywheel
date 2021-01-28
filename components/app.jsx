import React, { useEffect, useContext } from "react";
import isEqual from "lodash/isEqual";
import { Input } from "./input";
import { FretBoard } from "./fretboard";
import { Piano } from "./piano";
import { KeyWheel } from "./keywheel";
import {
    getNotes,
    getEmptySet,
    dup,
    onCopyToClipboard,
    getPegs,
    DEFAULT_NOTE_COLOR_OPTIONS,
} from "../util";
import {
    EMPTY,
    ROOT_REFERENCES,
    ORDERINGS,
    NOTE_NAMES,
    SHAPES,
    VERTICES,
} from "../consts";
import { COLORS, offWhite, lightGrey, darkGrey } from "../colors";
import { KeyWheelContext, useStore } from "../store";

const mainStyle = {
    boxSizing: "border-box",
};

const titleStyle = {
    fontSize: "1.75rem",
    padding: "10px",
};

const buttonStyle = {
    padding: "5px",
    backgroundColor: lightGrey,
    margin: "5px",
    textAlign: "center",
    minWidth: "60px",
    height: "30px",
    fontSize: "0.8rem",
    border: 0,
    borderRadius: "3px",
};

const navBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderBottom: "2px solid black",
    position: "fixed",
    top: 0,
    height: 50,
    zIndex: 9999,
    background: offWhite,
};

const leftPanelStyle = {
    position: "fixed",
    top: 50,
    overflowY: "scroll",
    zIndex: 9998,
    background: offWhite,
    width: "10vw",
    height: "calc(100vh - 50px)",
    boxShadow: "5px 0 10px 0 #888",
};

const mainContentStyle = {
    marginTop: 50,
    marginLeft: "10vw",
    background: offWhite,
};

const linkContainerStyle = {
    display: "flex",
    alignItems: "center",
};

// builds object with key pointing to textGeometry props for specific vertix
const buildThreeProps = (selected) => {
    const getNoteColors = (root, scaleType) => {
        const rootIdx = NOTE_NAMES.indexOf(root);
        if (rootIdx === -1) return DEFAULT_NOTE_COLOR_OPTIONS;

        const scaleNotes = getNotes(
            SHAPES[scaleType].map((note) => (note + rootIdx) % 12).sort()
        );

        const noteColors = scaleNotes.map((note) =>
            note ? [darkGrey] : [lightGrey]
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
    };

    const nextThreeProps = {};
    for (let key in VERTICES) {
        let { root, scaleType } = VERTICES[key];
        nextThreeProps[key] = getNoteColors(root, scaleType);
    }

    return nextThreeProps;
};

export const App = ({ oldState }) => {
    const { state, dispatch } = useContext(KeyWheelContext);
    const store = useStore((store) => store);

    useEffect(() => {
        rehydrateState();
        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const saveToLocalStorage = () => {
        dispatch({ type: "SAVE_TO_LOCAL_STORAGE" });
    };

    const rehydrateState = () => {
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

        updateThreeProps(newState.selected || getEmptySet());
        dispatch({ type: "REHYDRATE", payload: newState });
    };

    const onSaveToClipboard = (e) => {
        // save state to URL
        const savedState = dup(state);
        delete savedState.scales;

        history.pushState(
            "",
            "KeyWheel",
            `?q=${encodeURIComponent(JSON.stringify(savedState))}`
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
        let inc = e.key === "ArrowLeft" ? 2 : e.key === "ArrowRight" ? -2 : 0;
        if (inc) {
            e.preventDefault();
            shiftScale(inc);
        }
    };

    const shiftScale = (inc) => {
        dispatch({ type: "SHIFT_SCALE", payload: inc });
    };

    const updateThreeProps = (selected) => {
        const nextThreeProps = buildThreeProps(selected);
        for (let key in nextThreeProps) {
            if (!isEqual(nextThreeProps[key], store[key])) {
                store.set({ [key]: nextThreeProps[key] });
            }
        }
    };

    const clearNotes = (i = -1) => {
        if (i >= 0) {
            const selected = dup(state.selected);
            selected[i] = dup(EMPTY);

            updateThreeProps(selected);
            dispatch({ type: "SET_SELECTED", payload: selected });
        } else {
            const empty = getEmptySet();
            updateThreeProps(empty);
            dispatch({ type: "SET_SELECTED", payload: empty });
        }
    };

    const handleClick = (i, id) => {
        const selected = [];
        state.selected.forEach((notes) => {
            selected.push(dup(notes));
        });
        selected[id][i] = !selected[id][i];
        updateThreeProps(selected);
        dispatch({ type: "SET_SELECTED", payload: selected });
    };

    const handleGroup = (notes, id) => {
        const selected = [];
        state.selected.forEach((notes) => {
            selected.push(dup(notes));
        });
        selected[id] = notes;
        updateThreeProps(selected);
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

    const toggleKeyCube = () => {
        store.set({ keyCubeVisible: !store.keyCubeVisible });
    };

    const toggleKeyWheel = () => {
        const keyWheelVisible = !state.keyWheelVisible;
        dispatch({ type: "TOGGLE_KEY_WHEEL", payload: keyWheelVisible });
    };

    const toggleInstruments = () => {
        const instrumentsVisible = !state.instrumentsVisible;
        dispatch({ type: "TOGGLE_INSTRUMENTS", payload: instrumentsVisible });
    };

    const { selected, scales, mute, mode, rootReference, ordering } = state;

    if (!scales) return null;

    return (
        <div style={mainStyle}>
            <div style={navBarStyle}>
                <div style={titleStyle}>KeyWheel</div>
                <div
                    style={{
                        ...linkContainerStyle,
                        justifyContent: "flex-end",
                    }}
                >
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

            <div style={leftPanelStyle}>
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

            <div style={mainContentStyle}>
                <div
                    style={{
                        ...linkContainerStyle,
                        width: "80vw",
                        paddingTop: "20px",
                        margin: "0 auto",
                    }}
                >
                    <button style={buttonStyle} onClick={toggleInstruments}>
                        {state.instrumentsVisible ? "Hide" : "Show"} Instruments
                    </button>
                    <button style={buttonStyle} onClick={toggleKeyWheel}>
                        {state.keyWheelVisible ? "Hide" : "Show"} Key Wheel
                    </button>
                    <button style={buttonStyle} onClick={toggleKeyCube}>
                        {store.keyCubeVisible ? "Hide" : "Show"} Key Cube
                    </button>
                </div>

                {state.instrumentsVisible && (
                    <>
                        <div
                            style={{
                                margin: "30px auto",
                                width: "fit-content",
                            }}
                        >
                            <FretBoard
                                selected={selected}
                                style={{
                                    width: "80vw",
                                    height: "10vw",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                margin: "30px auto",
                                width: "fit-content",
                            }}
                        >
                            <Piano
                                selected={selected}
                                octaves={3}
                                style={{
                                    width: "80vw",
                                    height: "10vw",
                                }}
                            />
                        </div>
                    </>
                )}

                {state.keyWheelVisible && (
                    <div style={{ margin: "30px auto", width: "fit-content" }}>
                        <KeyWheel
                            selected={selected}
                            scales={scales}
                            rootReference={rootReference}
                            mode={mode}
                            mute={mute}
                            ordering={ordering}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
