import React, { useEffect, CSSProperties } from "react";
import {
    EMPTY,
    ROOT_REFERENCES,
    ORDERINGS,
    NOTE_NAMES,
    SHAPES,
} from "../consts";
import { offWhite, lightGrey } from "../colors";
import { useDerivedState } from "../store/hooks";
import { AppStore } from "../store/state";
import { AppStateType } from "../store/types";
import {
    ChordNames,
    NoteNames,
    Orderings,
    ReactChangeEvent,
    RootReferences,
} from "../types";
import { getNotes, getEmptySet, dup, onCopyToClipboard } from "../util";
import { Input } from "./input";
import { FretBoard } from "./fretboard";
import { Piano } from "./piano";
import { KeyWheel } from "./keywheel";
import { ThreeCanvas } from "./threecanvas";

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
    appStore: AppStore;
}

export const App: React.FC<AppProps> = ({ appStore }) => {
    const [getState] = useDerivedState(
        appStore,
        ({
            selected,
            scales,
            mute,
            mode,
            rootReference,
            ordering,
            noteNames,
            chordNames,
            chordCubeVisible,
            keyCubeVisible,
            keyWheelVisible,
            instrumentsVisible,
        }) => ({
            selected,
            scales,
            mute,
            mode,
            rootReference,
            ordering,
            noteNames,
            chordNames,
            chordCubeVisible,
            keyCubeVisible,
            keyWheelVisible,
            instrumentsVisible,
        }),
    );
    const {
        selected,
        scales,
        mute,
        mode,
        rootReference,
        ordering,
        noteNames,
        chordNames,
        chordCubeVisible,
        keyCubeVisible,
        keyWheelVisible,
        instrumentsVisible,
    } = getState();

    useEffect(() => {
        appStore.dispatch.initThreeProps();
        appStore.dispatch.rehydrate();
        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const saveToLocalStorage = () => {
        // handle react context
        appStore.dispatch.saveToLocalStorage();
    };

    const onSaveToClipboard = () => {
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

    const onNameChange = (e: ReactChangeEvent, i: number) => {
        const newNoteNames = [...noteNames];
        newNoteNames[i] = e.target.value as NoteNames;
        appStore.dispatch.changeName(newNoteNames);
        calculateChord(i);
    };

    const onChordChange = (e: ReactChangeEvent, i: number) => {
        const newChordNames = [...chordNames];
        newChordNames[i] = e.target.value as ChordNames;
        appStore.dispatch.changeChord(newChordNames);
        calculateChord(i);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
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
            const newSelected = dup(selected);
            newSelected[i] = dup(EMPTY);
            appStore.dispatch.setSelected(newSelected);
        } else {
            const empty = getEmptySet();
            appStore.dispatch.setSelected(empty);
        }
    };

    const clearAllNotes = () => {
        return clearNotes();
    };

    const handleClick = (i: number, id: number) => {
        const newSelected: boolean[][] = dup(selected);
        newSelected[id][i] = !newSelected[id][i];
        appStore.dispatch.setSelected(newSelected);
    };

    const handleGroup = (notes: boolean[], id: number) => {
        const newSelected: boolean[][] = [];
        selected.forEach((notes) => {
            newSelected.push(dup(notes));
        });
        newSelected[id] = notes;
        appStore.dispatch.setSelected(newSelected);
    };

    const toggleMode = () => {
        appStore.dispatch.toggleMode(
            mode === "union" ? "intersection" : "union",
        );
    };

    const changeRef = (e: ReactChangeEvent) => {
        appStore.dispatch.changeRootReference(
            e.currentTarget.value as RootReferences,
        );
    };

    const changeOrder = (e: ReactChangeEvent) => {
        appStore.dispatch.changeOrder(e.currentTarget.value as Orderings);
    };

    const toggleMute = () => {
        appStore.dispatch.toggleMute(!mute);
    };

    const toggleChordCube = () => {
        appStore.dispatch.toggleChordCube();
    };

    const toggleKeyCube = () => {
        appStore.dispatch.toggleKeyCube();
    };

    const toggleKeyWheel = () => {
        appStore.dispatch.toggleKeyWheel();
    };

    const toggleInstruments = () => {
        appStore.dispatch.toggleInstruments();
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
                    <button
                        style={buttonStyle}
                        onClick={toggleInstruments}
                        disabled={instrumentsVisible}
                    >
                        Show Instruments
                    </button>
                    <button
                        style={buttonStyle}
                        onClick={toggleKeyWheel}
                        disabled={keyWheelVisible}
                    >
                        Show Key Wheel
                    </button>
                    <button
                        style={buttonStyle}
                        onClick={toggleKeyCube}
                        disabled={keyCubeVisible}
                    >
                        Show Key Cube
                    </button>
                    <button
                        style={buttonStyle}
                        onClick={toggleChordCube}
                        disabled={chordCubeVisible}
                    >
                        Show Chord Cube
                    </button>
                    <button style={buttonStyle} onClick={onSaveToClipboard}>
                        Save To Clipboard
                    </button>
                    <button style={buttonStyle} onClick={toggleMute}>
                        {mute ? "Unmute" : "Mute"}
                    </button>
                    <button style={buttonStyle} onClick={clearAllNotes}>
                        Clear All
                    </button>
                    <select
                        onChange={changeRef}
                        style={buttonStyle}
                        defaultValue={"numbers"}
                    >
                        {Object.keys(ROOT_REFERENCES).map(
                            (key: RootReferences, i: number) => (
                                <option key={`reference-${i}`} value={key}>
                                    Label: {ROOT_REFERENCES[key]}
                                </option>
                            ),
                        )}
                    </select>
                    <select
                        onChange={changeOrder}
                        style={buttonStyle}
                        defaultValue={"chromatic"}
                    >
                        {Object.keys(ORDERINGS).map(
                            (key: Orderings, i: number) => (
                                <option key={`ordering-${i}`} value={key}>
                                    {/* {When you return, fix this so the ordering is passed by prop down to Scale} */}
                                    {ORDERINGS[key]}
                                </option>
                            ),
                        )}
                    </select>
                    <button style={buttonStyle} onClick={toggleMode}>
                        {`Mode: ${mode === "union" ? "Union" : "Intersection"}`}
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
                    marginTop: keyWheelVisible || instrumentsVisible ? 100 : 50,
                }}
            >
                {instrumentsVisible && (
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

                {keyWheelVisible && (
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

                <ThreeCanvas appStore={appStore} />
            </div>
        </div>
    );
};
