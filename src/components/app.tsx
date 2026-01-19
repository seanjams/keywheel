import React, { useEffect, CSSProperties } from "react";
import { offWhite, lightGrey } from "../colors";
import { useDerivedState } from "../store/hooks";
import { AppStore } from "../store/state";
import { Input } from "./input";
import { KeyWheel } from "./keywheel";
import { ThreeCanvas } from "./three/threecanvas";
import { Instruments } from "./instruments";
import { NavBar } from "./navbar";

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
        ({ keyWheelVisible, instrumentsVisible }) => ({
            keyWheelVisible,
            instrumentsVisible,
        }),
    );
    const { keyWheelVisible, instrumentsVisible } = getState();

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

    return (
        <div style={mainStyle}>
            <NavBar appStore={appStore} />

            <div style={leftPanelStyle}>
                <Input appStore={appStore} />
            </div>

            <div
                style={{
                    marginLeft: "10vw",
                    background: offWhite,
                    marginTop: keyWheelVisible || instrumentsVisible ? 100 : 50,
                }}
            >
                {instrumentsVisible && <Instruments appStore={appStore} />}

                {keyWheelVisible && (
                    <div style={{ margin: "30px auto", width: "fit-content" }}>
                        <KeyWheel appStore={appStore} />
                    </div>
                )}

                <ThreeCanvas appStore={appStore} />
            </div>
        </div>
    );
};
