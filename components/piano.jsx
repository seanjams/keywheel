import React from "react";
import { NOTE_NAMES } from "../consts";
import { getLabelColors } from "../util";

const blackKey = {
    width: "2%",
    height: "60%",
    zIndex: 1,
    margin: "0 -1%",
    background: "black",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,1)",
    boxSizing: "border-box",
    flexGrow: 1,
    flexBasis: 0,
};

const whiteKey = {
    flex: 2,
    height: "100%",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,1)",
    boxSizing: "border-box",
    flexBasis: 0,
};

export const Piano = (props) => {
    const colors = getLabelColors(props.selected, true);
    const octaves = props.octaves || 2;
    const pianoStyle = {
        width: props.style.width,
        height: props.style.height,
        boxShadow: "0 0 0 2px rgba(0,0,0,1)",
        display: "flex",
    };

    let names = [...NOTE_NAMES];
    for (let i = 1; i < octaves; i++) {
        names = names.concat(names);
    }

    const keys = names.map((name, i) => {
        const style = Object.assign(
            {},
            name.length > 1 ? blackKey : whiteKey,
            colors[name]
        );

        return (
            <div key={`piano-${i}`} style={style}>
                {name === "C" && name}
            </div>
        );
    });

    return <div style={pianoStyle}>{keys}</div>;
};
