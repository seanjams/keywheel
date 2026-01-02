import React, { useEffect, CSSProperties } from "react";
import { Input } from "./input";
import { FretBoard } from "./fretboard";
import { Piano } from "./piano";
import { KeyWheel } from "./keywheel";
import { getNotes, getEmptySet, dup, onCopyToClipboard } from "../util";
import {
    EMPTY,
    ROOT_REFERENCES,
    ORDERINGS,
    NOTE_NAMES,
    SHAPES,
} from "../consts";
import { offWhite, lightGrey } from "../colors";
import { AppStateType, AppStore } from "../store2/state";
import { useDerivedState } from "../store2/hooks";
import { KeyCube } from "./keycube";

const mainStyle: CSSProperties = {
    boxSizing: "border-box",
};

const titleStyle: CSSProperties = {
    fontSize: "1.75rem",
    padding: "10px",
};

const buttonStyle: CSSProperties = {
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

const navBarStyle: CSSProperties = {
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

const leftPanelStyle: CSSProperties = {
    position: "fixed",
    top: 50,
    overflowY: "scroll",
    zIndex: 9998,
    background: offWhite,
    width: "10vw",
    height: "calc(100vh - 50px)",
    boxShadow: "5px 0 10px 0 #888",
};

const linkContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
};

interface AppProps {
    oldState: Partial<AppStateType>;
    appStore: AppStore;
}

export const App: React.FC<AppProps> = ({ oldState, appStore }) => {
    const [getState] = useDerivedState(appStore, (state) => ({
        ...state,
    }));
    const state = getState();
    const {
        selected,
        scales,
        mute,
        mode,
        rootReference,
        ordering,
        noteNames,
        chordNames,
    } = getState();

    useEffect(() => {
        // rehydrateState();
        window.addEventListener("keydown", handleKeyPress);
        // window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            // saveToLocalStorage();
            // window.removeEventListener("beforeunload", saveToLocalStorage);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const saveToLocalStorage = () => {
        // handle react context
        appStore.dispatch.saveToLocalStorage();
    };

    const rehydrateState = () => {
        let newState: Partial<AppStateType> = {};
        for (let key in getState()) {
            if (
                oldState &&
                oldState[key] !== undefined &&
                oldState[key] !== null
            ) {
                newState[key] = oldState[key];
            } else if (localStorage.hasOwnProperty(key)) {
                let val = localStorage.getItem(key);
                try {
                    val = val !== null && JSON.parse(val);
                    newState[key] = val;
                } catch (e) {
                    newState[key] = getState()[key];
                }
            }
        }

        appStore.dispatch.rehydrate(newState);
        appStore.dispatch.setSelected(newState.selected || getEmptySet());
        appStore.dispatch.toggleKeyCube(
            !newState.keyWheelVisible && !newState.instrumentsVisible,
        );
    };

    const onSaveToClipboard = (e) => {
        // save state to URL
        const savedState: Partial<AppStateType> = dup(getState());
        delete savedState.scales;

        history.pushState(
            "",
            "KeyWheel",
            `?q=${encodeURIComponent(JSON.stringify(savedState))}`,
        );

        // copy to clipboard
        onCopyToClipboard(window.location.href);
    };

    const calculateChord = (i: number) => {
        const { noteNames, chordNames } = getState();
        const rootIdx = NOTE_NAMES.indexOf(noteNames[i]);
        const pegs = SHAPES[chordNames[i]]
            .map((note) => (note + rootIdx) % 12)
            .sort();
        handleGroup(getNotes(pegs), i);
    };

    const onNameChange = (e, i) => {
        const newNoteNames = [...noteNames];
        newNoteNames[i] = e.target.value;
        appStore.dispatch.changeName(newNoteNames);
        calculateChord(i);
    };

    const onChordChange = (e, i) => {
        const newChordNames = [...chordNames];
        newChordNames[i] = e.target.value;
        appStore.dispatch.changeChord(newChordNames);
        calculateChord(i);
    };

    const handleKeyPress = (e) => {
        let inc = e.key === "ArrowLeft" ? 2 : e.key === "ArrowRight" ? -2 : 0;
        if (inc) {
            e.preventDefault();
            shiftScale(inc);
        }
    };

    const shiftScale = (inc: number) => {
        appStore.dispatch.shiftScale(inc);
    };

    const clearNotes = (i = -1) => {
        if (i >= 0) {
            const selected = dup(state.selected);
            selected[i] = dup(EMPTY);
            appStore.dispatch.setSelected(selected);
        } else {
            const empty = getEmptySet();
            appStore.dispatch.setSelected(empty);
        }
    };

    const clearAllNotes = () => {
        return clearNotes();
    };

    const handleClick = (i, id) => {
        const selected: boolean[][] = [];
        state.selected.forEach((notes) => {
            selected.push([...notes]);
        });
        selected[id][i] = !selected[id][i];
        appStore.dispatch.setSelected(selected);
    };

    const handleGroup = (notes, id) => {
        const selected: boolean[][] = [];
        state.selected.forEach((notes) => {
            selected.push(dup(notes));
        });
        selected[id] = notes;
        appStore.dispatch.setSelected(selected);
    };

    const toggleMode = () => {
        const mode = state.mode === "union" ? "intersection" : "union";
        appStore.dispatch.toggleMode(mode);
    };

    const changeRef = (e) => {
        appStore.dispatch.changeRootReference(e.currentTarget.value);
    };

    const changeOrder = (e) => {
        appStore.dispatch.changeOrder(e.currentTarget.value);
    };

    const toggleMute = () => {
        const mute = !state.mute;
        appStore.dispatch.toggleMute(mute);
    };

    const toggleKeyCube = () => {
        const keyCubeVisible = !getState().keyCubeVisible;
        appStore.dispatch.toggleKeyCube(keyCubeVisible);
    };

    const toggleKeyWheel = () => {
        const keyWheelVisible = !getState().keyWheelVisible;
        appStore.dispatch.toggleKeyWheel(keyWheelVisible);
    };

    const toggleInstruments = () => {
        const instrumentsVisible = !getState().instrumentsVisible;
        appStore.dispatch.toggleInstruments(instrumentsVisible);
    };

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
                    <button style={buttonStyle} onClick={toggleInstruments}>
                        {state.instrumentsVisible ? "Hide" : "Show"} Instruments
                    </button>
                    <button style={buttonStyle} onClick={toggleKeyWheel}>
                        {state.keyWheelVisible ? "Hide" : "Show"} Key Wheel
                    </button>
                    <button style={buttonStyle} onClick={toggleKeyCube}>
                        {state.keyCubeVisible ? "Hide" : "Show"} Key Cube
                    </button>
                    <button style={buttonStyle} onClick={onSaveToClipboard}>
                        Save To Clipboard
                    </button>
                    <button style={buttonStyle} onClick={toggleMute}>
                        {state.mute ? "Unmute" : "Mute"}
                    </button>
                    <button style={buttonStyle} onClick={clearAllNotes}>
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

            <div
                style={{
                    marginLeft: "10vw",
                    background: offWhite,
                    marginTop:
                        state.keyWheelVisible || state.instrumentsVisible
                            ? 100
                            : 50,
                }}
            >
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

                <div
                    style={{
                        margin: "30px auto",
                        width: "fit-content",
                        display: state.keyCubeVisible ? "block" : "none", // don't unmount the Canvas when hiding
                    }}
                >
                    <KeyCube appStore={appStore} />
                </div>
            </div>
        </div>
    );
};
