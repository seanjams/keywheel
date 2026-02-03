import React, { useEffect, CSSProperties } from "react";
import { offWhite } from "../util";
import { useDerivedState } from "../store/hooks";
import { AppStore } from "../store/state";
import { Input } from "./input";
import { KeyWheel } from "./keywheel";
import { ThreeCanvas } from "./three/threecanvas";
import { Instruments } from "./instruments";
import { NavBar } from "./navbar";
import { DisplayType } from "../store/types";

const mainStyle: CSSProperties = {
    boxSizing: "border-box",
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
interface AppProps {
    appStore: AppStore;
}

export const App: React.FC<AppProps> = ({ appStore }) => {
    const [getState] = useDerivedState(appStore, ({ display }) => ({
        keyWheelVisible: display == DisplayType.keyWheel,
        instrumentsVisible: display == DisplayType.instruments,
    }));
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
