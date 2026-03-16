import React from "react";
import { AppStore } from "../store/state";
import { useDerivedState } from "../store/hooks";
import FretBoard from "./fretboard";
import { Piano } from "./piano";

interface InstrumentsProps {
    appStore: AppStore;
}

export const Instruments: React.FC<InstrumentsProps> = ({ appStore }) => {
    const [getState] = useDerivedState(appStore, ({ selected }) => ({
        selected,
    }));
    const { selected } = getState();

    return (
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
    );
};
