import React, { CSSProperties, useEffect, useState } from "react";

import { AppStore } from "../../store/state";
import { ChordNames, NoteNames } from "../../types";
import { SceneKey } from "../../store/types";
import { grey, lightGrey, NOTE_NAMES } from "../../util";
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
    backgroundColor: lightGrey,
    cursor: "pointer",
};

const toolBarTitleStyle: CSSProperties = {
    fontWeight: "bold",
    fontSize: "0.75rem",
    margin: "16px 0 4px 0",
};

const pressedButtonStyle: CSSProperties = {
    boxShadow: "rgb(26, 26, 26, 0.4) 0px 1px 4px inset",
    backgroundColor: grey,
};

const bulletPoint = (
    <span
        style={{
            position: "relative",
            left: "-8px",
            marginRight: "-8px",
            width: "0px",
        }}
    >
        •{" "}
    </span>
);

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

    const hideToolBarButton = (
        <div
            style={{
                ...buttonStyle,
                height: "22px",
                padding: "3px",
                width: "fit-content",
                margin: "0",
            }}
            onClick={onHide}
        >
            {hideToolBar ? "show toolbar" : "hide toolbar"}
        </div>
    );

    if (hideToolBar) {
        return (
            <div
                style={{
                    position: "relative",
                    top: "15px",
                    left: "15px",
                    height: "22px",
                    marginBottom: "-22px",
                }}
            >
                {hideToolBarButton}
            </div>
        );
    }

    return (
        <div
            style={{
                background: "rgb(220, 220, 220, 0.8)",
                borderRadius: "4px",
                height: "650px",
                width: "140px",
                position: "relative",
                top: "10px",
                left: "10px",
                marginBottom: "-650px",
                zIndex: "9999",
                padding: "5px",
            }}
        >
            {hideToolBarButton}
            {!hideToolBar && (
                <>
                    <p style={toolBarTitleStyle}>Controls</p>
                    <ul style={{ fontSize: "0.75rem", padding: "0 10px" }}>
                        <li>
                            {bulletPoint}
                            click and drag to rotate
                        </li>
                        <li>{bulletPoint}right click and drag to move</li>
                        <li>{bulletPoint}scroll to zoom</li>
                    </ul>

                    <p style={toolBarTitleStyle}>Visibility</p>

                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "start",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
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
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
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
                </>
            )}
        </div>
    );
};
