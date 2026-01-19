import React, { CSSProperties } from "react";
import { ROOT_REFERENCES, ORDERINGS } from "../consts";
import { offWhite, lightGrey } from "../colors";
import { useDerivedState } from "../store/hooks";
import { AppStore } from "../store/state";
import { AppStateType } from "../store/types";
import { Orderings, ReactChangeEvent, RootReferences } from "../types";
import { getEmptySet, dup, onCopyToClipboard } from "../util";

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

interface NavBarProps {
    appStore: AppStore;
}

export const NavBar: React.FC<NavBarProps> = ({ appStore }) => {
    const [getState] = useDerivedState(
        appStore,
        ({
            mute,
            mode,
            chordCubeVisible,
            keyCubeVisible,
            keyWheelVisible,
            instrumentsVisible,
        }) => ({
            mute,
            mode,
            chordCubeVisible,
            keyCubeVisible,
            keyWheelVisible,
            instrumentsVisible,
        }),
    );
    const {
        mute,
        mode,
        chordCubeVisible,
        keyCubeVisible,
        keyWheelVisible,
        instrumentsVisible,
    } = getState();

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

    const clearAllNotes = () => {
        const empty = getEmptySet();
        appStore.dispatch.setSelected(empty);
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
                    {Object.keys(ORDERINGS).map((key: Orderings, i: number) => (
                        <option key={`ordering-${i}`} value={key}>
                            {/* {When you return, fix this so the ordering is passed by prop down to Scale} */}
                            {ORDERINGS[key]}
                        </option>
                    ))}
                </select>
                <button style={buttonStyle} onClick={toggleMode}>
                    {`Mode: ${mode === "union" ? "Union" : "Intersection"}`}
                </button>
                <button style={buttonStyle}>
                    <a href="https://github.com/seanjams/keywheel">source</a>
                </button>
            </div>
        </div>
    );
};
