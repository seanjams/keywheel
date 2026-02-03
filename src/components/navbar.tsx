import React, { CSSProperties } from "react";
import { useDerivedState } from "../store/hooks";
import { AppStore } from "../store/state";
import { AppStateType, DisplayType } from "../store/types";
import { Orderings, ReactChangeEvent, RootReferences } from "../types";
import {
    ROOT_REFERENCES,
    ORDERINGS,
    dup,
    onCopyToClipboard,
    offWhite,
    lightGrey,
} from "../util";

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
    const [getState] = useDerivedState(appStore, ({ mute, display }) => ({
        mute,
        display,
    }));
    const { mute, display } = getState();

    const onSaveToClipboard = () => {
        // save state to URL
        const savedState: Partial<AppStateType> = dup(appStore.state);
        delete savedState.scales;

        history.pushState(
            "",
            "KeyWheel",
            `?q=${encodeURIComponent(JSON.stringify(savedState))}`,
        );

        // copy to clipboard
        onCopyToClipboard(window.location.href);
    };

    const changeRootReference = (e: ReactChangeEvent) => {
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

    const changeView = (e: ReactChangeEvent) => {
        appStore.dispatch.changeDisplay(e.currentTarget.value as DisplayType);
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
                <select
                    onChange={changeView}
                    style={buttonStyle}
                    defaultValue={display}
                >
                    {[
                        DisplayType.chordCube,
                        DisplayType.keyCube,
                        DisplayType.instruments,
                        DisplayType.keyWheel,
                    ].map((display: DisplayType) => (
                        <option
                            key={`display-option-${display}`}
                            value={display}
                        >
                            {display}
                        </option>
                    ))}
                </select>
                {/* <button style={buttonStyle} onClick={onSaveToClipboard}>
                    Save To Clipboard
                </button> */}
                <button style={buttonStyle} onClick={toggleMute}>
                    {mute ? "Unmute" : "Mute"}
                </button>
                <select
                    onChange={changeRootReference}
                    style={buttonStyle}
                    defaultValue={RootReferences.names}
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
                    defaultValue={Orderings.chromatic}
                >
                    {Object.keys(ORDERINGS).map((key: Orderings, i: number) => (
                        <option key={`ordering-${i}`} value={key}>
                            {/* {When you return, fix this so the ordering is passed by prop down to Scale} */}
                            {ORDERINGS[key]}
                        </option>
                    ))}
                </select>
                <button style={buttonStyle}>
                    <a href="https://github.com/seanjams/keywheel">source</a>
                </button>
            </div>
        </div>
    );
};
