import React, { CSSProperties, useEffect, useState } from "react";

import { AppStore } from "../../store/state";
import { ChordNames, NoteNames } from "../../types";
import { SceneKey } from "../../store/types";
import { grey, lighterGrey, lightGrey, NOTE_NAMES } from "../../util";
import { useDerivedState } from "../../store/hooks";

interface ToolBarProps {
    appStore: AppStore;
    scene: SceneKey;
    chordNames: ChordNames[];
}

const buttonStyle: CSSProperties = {
    padding: "5px",
    margin: "5px",
    textAlign: "center",
    minWidth: "60px",
    height: "30px",
    fontSize: "0.8rem",
    border: 0,
    borderRadius: "3px",
    boxShadow: "rgb(26, 26, 26, 0.4) 0px 2px 4px",
    backgroundColor: grey,
};

const pressedButtonStyle = {
    boxShadow: "rgb(52, 52, 52, 0.4) 0px 1px 4px inset",
    backgroundColor: lightGrey,
};

export const ToolBar: React.FC<ToolBarProps> = ({
    appStore,
    scene,
    chordNames,
}) => {
    const [hideToolBar, setHideToolbar] = useState(false);

    const [getState] = useDerivedState(appStore, ({ keyCube, chordCube }) => {
        const { hiddenNoteNames, hiddenChordNames } =
            scene === SceneKey.keyCube ? keyCube : chordCube;
        return {
            hiddenNoteNames,
            hiddenChordNames,
        };
    });
    const { hiddenNoteNames, hiddenChordNames } = getState();

    const toggleVisibleNoteName = (noteName: NoteNames) => {
        const hiddenNoteNamesSet = new Set(hiddenNoteNames);
        hiddenNoteNamesSet.has(noteName)
            ? hiddenNoteNamesSet.delete(noteName)
            : hiddenNoteNamesSet.add(noteName);

        const newHiddenNoteNames = [...hiddenNoteNamesSet];

        appStore.dispatch.hideVerticesByType(
            scene,
            newHiddenNoteNames,
            hiddenChordNames,
        );
    };

    const toggleVisibleChordName = (chordName: ChordNames) => {
        const hiddenChordNamesSet = new Set(hiddenChordNames);
        hiddenChordNamesSet.has(chordName)
            ? hiddenChordNamesSet.delete(chordName)
            : hiddenChordNamesSet.add(chordName);

        const newHiddenChordNames = [...hiddenChordNamesSet];

        appStore.dispatch.hideVerticesByType(
            scene,
            hiddenNoteNames,
            newHiddenChordNames,
        );
    };

    const onHide = () => {
        setHideToolbar((prev) => !prev);
    };

    // useEffect(() => {
    //     appStore.dispatch.hideVerticesByType(
    //         scene,
    //         [
    //             NoteNames.Db,
    //             NoteNames.D,
    //             NoteNames.Eb,
    //             NoteNames.E,
    //             NoteNames.F,
    //             NoteNames.Gb,
    //             NoteNames.G,
    //             NoteNames.Ab,
    //             NoteNames.A,
    //             NoteNames.Bb,
    //             NoteNames.B,
    //         ],
    //         [],
    //     );
    // }, []);

    return (
        <div
            style={{
                background: "rgb(220, 220, 220, 0.4)",
                borderRadius: "4px",
                height: "80px",
                width: "fit-content",
                position: "relative",
                top: "10px",
                left: "10px",
                marginBottom: "-120px",
                zIndex: "9999",
                padding: "5px",
            }}
        >
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: hideToolBar ? "center" : "end",
                }}
            >
                {!hideToolBar && (
                    <div style={{ height: "100%" }}>
                        <div
                            style={{
                                height: "50%",
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                padding: "10px",
                            }}
                        >
                            Root Note:&nbsp;
                            {NOTE_NAMES.map((noteName) => (
                                <button
                                    key={`note-visible-button-${noteName}`}
                                    style={{
                                        ...buttonStyle,
                                        ...(hiddenNoteNames.includes(noteName)
                                            ? {}
                                            : pressedButtonStyle),
                                        minWidth: "50px",
                                    }}
                                    onClick={() =>
                                        toggleVisibleNoteName(noteName)
                                    }
                                >
                                    {noteName}
                                </button>
                            ))}
                        </div>
                        <div
                            style={{
                                height: "50%",
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                padding: "10px",
                            }}
                        >
                            Chord Quality:&nbsp;
                            {chordNames.map((chordName) => (
                                <button
                                    key={`chord-visible-button-${chordName}`}
                                    style={{
                                        ...buttonStyle,
                                        ...(hiddenChordNames.includes(chordName)
                                            ? {}
                                            : pressedButtonStyle),
                                    }}
                                    onClick={() =>
                                        toggleVisibleChordName(chordName)
                                    }
                                >
                                    {chordName}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div
                    style={{
                        textAlign: "center",
                        cursor: "pointer",
                    }}
                    onClick={onHide}
                >
                    {hideToolBar ? "show" : "hide"}
                </div>
            </div>
        </div>
    );
};
