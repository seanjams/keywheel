import React, { CSSProperties } from "react";
import { ScaleNode } from "../util";
import { Scale } from "./scale";
import { AppStore } from "../store/state";
import { useDerivedState } from "../store/hooks";

interface KeyWheelProps {
    appStore: AppStore;
}

export const KeyWheel: React.FC<KeyWheelProps> = ({ appStore }) => {
    const [getState] = useDerivedState(appStore, ({ scales }) => ({
        scales,
    }));
    const { scales } = getState();

    const scaleComponents = scales.map((node: ScaleNode, i: number) => {
        const rowShift = i % 12 > 5 ? 1 : 0;
        const colStart = 4 * (i % 6) + 2 * rowShift + 1;
        const rowStart = 2 * Math.floor(6 * (i / 36)) + 1;

        const style: CSSProperties = {
            position: "relative",
            gridColumn: `${colStart}/ span 3`,
            gridRow: `${rowStart}/ span 3`,
        };

        return (
            <Scale
                key={i}
                notes={node.notes} //array of 12 bools, the notes that are part of the scale
                isInput={false} //bool for styling svg and event handlers of input type scales
                index={-1} //int for color index of input type scales
                style={style} // scale container style
                appStore={appStore}
            />
        );
    });

    return (
        <div
            style={{
                display: "grid",
                height: "40vw",
                width: "80vw",
                gridTemplateColumns: "2fr repeat(12, 5fr 2fr) 2fr",
                gridTemplateRows: "2fr repeat(6, 5fr 2fr)",
            }}
        >
            {scaleComponents}
        </div>
    );
};
