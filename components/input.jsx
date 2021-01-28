import React, { useEffect } from "react";
import { Scale } from "./scale";
import { EMPTY, SHAPES, NOTE_NAMES } from "../consts";
import { lightGrey } from "../colors";
import { getPegs, soundNotes, chordReader, dup } from "../util";

const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "5px auto",
};

const buttonStyle = {
    padding: "3px",
    backgroundColor: lightGrey,
    borderRadius: 0,
    margin: "2px",
    textAlign: "center",
    fontSize: "0.6rem",
    cursor: "pointer",
};

const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
};

const selectContainerStyle = {
    display: "flex",
    justifyContent: "center",
    height: 16,
    margin: "4px auto",
};

export const Input = (props) => {
    useEffect(() => {
        const handleKeyPress = (e) => {
            const i = parseInt(e.key);
            if (i > 0 && i < 9) soundChord(i - 1);
        };

        window.addEventListener("keypress", handleKeyPress);
        return () => window.removeEventListener("keypress", handleKeyPress);
    }, []);

    const soundChord = (i) => {
        if (!props.mute) {
            const { rootIdx } = chordReader(props.selected[i]);
            const chord = getPegs(props.selected[i]);
            const modeIdx = chord.indexOf(rootIdx);
            soundNotes(chord, modeIdx, true);
        }
    };

    const { selected } = props;

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
                                    onClick={() => props.clearNotes(i)}
                                >
                                    Clear
                                </button>
                            </div>
                            <div style={selectContainerStyle}>
                                <select
                                    style={{ fontSize: "0.7vw" }}
                                    onChange={(e) => props.onNameChange(e, i)}
                                    defaultValue=""
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
                                    onChange={(e) => props.onChordChange(e, i)}
                                    defaultValue=""
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
                                notes={dup(EMPTY)}
                                index={i}
                                selected={selected}
                                handleClick={(k) => props.handleClick(k, i)}
                                rootReference={props.rootReference}
                                isInput={true}
                                mode={props.mode}
                                mute={props.mute}
                                ordering={props.ordering}
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
