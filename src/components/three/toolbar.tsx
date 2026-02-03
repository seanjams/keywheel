import React, { CSSProperties, useState } from "react";

import { AppStore } from "../../store/state";
import { ChordNames, NoteNames } from "../../types";
import { SceneKey } from "../../store/types";
import { grey, lighterGrey, lightGrey, NOTE_NAMES } from "../../util";

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
};

export const ToolBar: React.FC<ToolBarProps> = ({
    appStore,
    scene,
    chordNames,
}) => {
    const [hiddenNoteNames, setHiddenNoteNames] = useState<NoteNames[]>([]);
    const [hiddenChordNames, setHiddenChordNames] = useState<ChordNames[]>([]);

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

        setHiddenNoteNames(newHiddenNoteNames);
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

        setHiddenChordNames(newHiddenChordNames);
    };

    return (
        <div
            style={{
                background: lighterGrey,
                borderRadius: "4px",
                height: "80px",
                width: "fit-content",
                position: "relative",
                top: "20px",
                left: "20px",
                marginBottom: "-120px",
                zIndex: "9999",
                padding: "5px",
            }}
        >
            <div
                style={{
                    height: "50%",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: "10px",
                }}
            >
                {NOTE_NAMES.map((noteName) => (
                    <button
                        key={`note-visible-button-${noteName}`}
                        style={{
                            ...buttonStyle,
                            backgroundColor: hiddenNoteNames.includes(noteName)
                                ? lightGrey
                                : grey,
                        }}
                        onClick={() => toggleVisibleNoteName(noteName)}
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
                {chordNames.map((chordName) => (
                    <button
                        key={`chord-visible-button-${chordName}`}
                        style={{
                            ...buttonStyle,
                            backgroundColor: hiddenChordNames.includes(
                                chordName,
                            )
                                ? lightGrey
                                : grey,
                        }}
                        onClick={() => toggleVisibleChordName(chordName)}
                    >
                        {chordName}
                    </button>
                ))}
            </div>
        </div>
    );
};
