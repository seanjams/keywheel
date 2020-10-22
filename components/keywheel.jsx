import React from "react";
import { Scale } from "./scale";

export const KeyWheel = (props) => {
    const { selected, scales, rootReference, mode, mute, ordering } = props;
    const scaleComponents = scales.map((node, i) => {
        const rowShift = i % 12 > 5 ? 1 : 0;
        const colStart = 4 * (i % 6) + 2 * rowShift + 1;
        const rowStart = 2 * Math.floor(6 * (i / 36)) + 1;

        const style = {
            position: "relative",
            gridColumn: `${colStart}/ span 3`,
            gridRow: `${rowStart}/ span 3`,
        };

        return (
            <Scale
                key={i}
                notes={node.notes} //array of 12 bools, the notes that are part of the scale
                selected={selected} //array of 8 separate notes objects for svg and coloring
                isInput={false} //bool for styling svg and event handlers of input type scales
                mode={mode} //string for deciding how to render svg
                rootReference={rootReference} //bool for labeling notes
                index={-1} //int for color index of input type scales
                mute={mute} //bool for volume
                style={style} // scale container style
                ordering={ordering} //key representing what order to arrange notes
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
