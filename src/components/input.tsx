import React, { CSSProperties, useEffect } from "react";
import { ChordNames, NoteNames, ReactChangeEvent } from "../types";
import {
    EMPTY,
    SHAPES,
    NOTE_NAMES,
    getPegs,
    soundNotes,
    chordReader,
    dup,
    lightGrey,
} from "../util";
import { Scale } from "./scale";
import { AppStore } from "../store/state";
import { useDerivedState } from "../store/hooks";

const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "5px auto",
};

const buttonStyle: CSSProperties = {
    padding: "3px",
    backgroundColor: lightGrey,
    borderRadius: 0,
    margin: "2px",
    textAlign: "center",
    fontSize: "0.6rem",
    cursor: "pointer",
};

const buttonContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
};

const selectContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    height: 16,
    margin: "4px auto",
};

interface InputProps {
    appStore: AppStore;
}

export const Input: React.FC<InputProps> = ({ appStore }) => {
    const [getState] = useDerivedState(
        appStore,
        ({ selected, mute, selectedRootIndices, selectedChordNames }) => ({
            selected,
            mute,
            selectedRootIndices,
            selectedChordNames,
        }),
    );
    const { selected, mute, selectedRootIndices, selectedChordNames } =
        getState();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const i = parseInt(e.key);
            if (i > 0 && i < 9) soundChord(i - 1);
        };

        window.addEventListener("keypress", handleKeyPress);
        return () => window.removeEventListener("keypress", handleKeyPress);
    }, []);

    const soundChord = (i: number) => {
        if (!mute) {
            const { rootIdx } = chordReader(selected[i]);
            const chord = getPegs(selected[i]);
            const modeIdx = chord.indexOf(rootIdx);
            soundNotes(chord, modeIdx, true);
        }
    };

    const clearNotes = (i: number) => {
        if (i >= 0 && i < selected.length) {
            const newSelected = dup(selected);
            newSelected[i] = dup(EMPTY);
            appStore.dispatch.setSelected(newSelected);
        }
    };

    const onNameChange = (e: ReactChangeEvent, i: number) => {
        appStore.dispatch.changeName(e.target.value as NoteNames, i);
    };

    const onChordChange = (e: ReactChangeEvent, i: number) => {
        appStore.dispatch.changeChord(e.target.value as ChordNames, i);
    };

    const handleClick = (i: number, id: number) => {
        const newSelected: boolean[][] = dup(selected);
        newSelected[id][i] = !newSelected[id][i];
        appStore.dispatch.setSelected(newSelected);
    };

    return (
        <div style={containerStyle}>
            <div style={{ height: "100%", overflowY: "auto" }}>
                {selected.map((_, i) => {
                    return (
                        <div
                            key={`input-${i}`}
                            style={{ textAlign: "center", margin: "4px auto" }}
                        >
                            <div style={buttonContainerStyle}>
                                <button
                                    style={buttonStyle}
                                    onClick={() => soundChord(i)}
                                >
                                    Sound
                                </button>
                                <button
                                    style={buttonStyle}
                                    onClick={() => clearNotes(i)}
                                >
                                    Clear
                                </button>
                            </div>
                            <div style={selectContainerStyle}>
                                <select
                                    style={{ fontSize: "0.7vw" }}
                                    onChange={(e) => onNameChange(e, i)}
                                    defaultValue=""
                                    value={selectedRootIndices[i] || ""}
                                >
                                    <option disabled value="">
                                        --
                                    </option>
                                    {NOTE_NAMES.map((name, j) => {
                                        return (
                                            <option
                                                key={`note-name-${j}`}
                                                value={name}
                                            >
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <select
                                    style={{ fontSize: "0.7vw" }}
                                    onChange={(e) => onChordChange(e, i)}
                                    defaultValue=""
                                    value={selectedChordNames[i] || ""}
                                >
                                    <option disabled value="">
                                        --
                                    </option>
                                    {Object.keys(SHAPES).map((chordName, j) => {
                                        return (
                                            <option
                                                key={`chord-name-${j}`}
                                                value={chordName}
                                            >
                                                {chordName}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <Scale
                                appStore={appStore}
                                notes={dup(EMPTY)}
                                index={i}
                                handleClick={(k) => handleClick(k, i)}
                                isInput={true}
                                style={{
                                    width: "7vw",
                                    height: "7vw",
                                    position: "relative",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
