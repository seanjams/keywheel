import React, { CSSProperties } from "react";
import {
    darkGrey,
    lightGrey,
    offWhite,
    gold,
    brown,
    transparent,
    COLORS,
} from "../colors";

import { NOTE_RADIUS, SCALE_RADIUS, NOTE_NAMES, EMPTY } from "../consts";

import {
    getPegs,
    mergeNotes,
    chordReader,
    rotate,
    soundNotes,
    getMajor,
    mod,
} from "../util";
import { Mode, Orderings, RootReferences } from "../store2/types";

const textStyle: CSSProperties = {
    position: "relative",
    top: "34%",
    textAlign: "center",
    height: 0,
    fontSize: "0.95vw",
};

const svgContainerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
};

interface ScaleProps {
    notes: boolean[]; //array of 12 bools, the notes that are part of the scale
    selected: boolean[][]; //array of 8 separate notes objects for svg and coloring
    isInput: boolean; //bool for styling svg and event handlers of input type scales
    mode: Mode; //string for deciding how to render svg
    rootReference: RootReferences; //bool for labeling notes
    index: number; //int for color index of input type scales
    mute: boolean; //bool for volume
    style: CSSProperties; // scale container style
    ordering: Orderings; //key representing what order to arrange notes
    handleClick?: (i: number) => void;
}

export const Scale: React.FC<ScaleProps> = ({
    notes,
    selected,
    mode,
    rootReference,
    index,
    mute,
    isInput,
    style,
    ordering,
    handleClick,
}) => {
    const getSVG = () => {
        let result: boolean[][] = [];
        let colorIdx = 8;

        if (isInput) {
            if (index >= 0) {
                result.push(selected[index]);
                colorIdx = index;
            }
        } else if (mode === "intersection") {
            const collected = mergeNotes(selected);
            const pegs = getPegs(collected);
            const isMatch = pegs.every((i) => notes[i]);
            if (isMatch && pegs.length > 0) result.push(collected);
        } else if (mode === "union") {
            selected.forEach((arr, i) => {
                const pegs = getPegs(arr);
                const isMatch = pegs.every((i) => notes[i]);
                result.push(isMatch && pegs.length > 0 ? arr : []);
            });
        }

        return result.map((arr, i) => {
            if (arr.length === 0) return null;
            let pegs = getPegs(arr);
            if (pegs.length < 3) return null;

            const style: CSSProperties = { stroke: lightGrey, strokeWidth: 1 };
            style.fill =
                result.length > 1 ? COLORS(0.5)[i] : COLORS(0.5)[colorIdx];

            if (ordering === "fifths") {
                pegs = pegs
                    .map((peg) => mod(7 * peg, 12))
                    .sort((a, b) => a - b);
            }

            const points = pegs.map((peg, i) => {
                const x =
                    SCALE_RADIUS * (1 + Math.sin((Math.PI * peg) / 6)) +
                    NOTE_RADIUS;
                const y =
                    SCALE_RADIUS * (1 - Math.cos((Math.PI * peg) / 6)) +
                    NOTE_RADIUS;
                return `${x},${y}`;
            });

            return {
                points: points.join(" "),
                style: style,
            };
        });
    };

    const onClick = (pegs: number[], i: number) => {
        if (handleClick) {
            handleClick(i);
        } else if (!mute) {
            if (i === -1) {
                soundNotes(pegs, 0, false);
                return;
            }
            let idx = pegs.indexOf(i);
            if (idx >= 0) soundNotes(pegs, idx, false);
        }
    };

    const noteComponents = (
        notes: boolean[],
        pegs: number[],
        relMajor: number[],
        rootIdx = -1,
    ) => {
        return notes.map((note: boolean, i: number) => {
            let m = i;
            if (ordering === "fifths") {
                m = mod(7 * i, 12);
            }
            note = notes[m];

            let color = darkGrey;
            let borderColor = darkGrey;
            let backgroundColor = transparent;
            let noteColor: string = "";
            let numLabel: string = "";

            const isMatch = () =>
                selected.some((arr, j) => {
                    const arrPegs = getPegs(arr);
                    const match =
                        arr[m] &&
                        arrPegs.length > 0 &&
                        arrPegs.every((k) => notes[k]);
                    if (match && !noteColor) noteColor = COLORS(1)[j];
                    return match;
                });

            if (isInput) {
                numLabel = NOTE_NAMES[m];
                if (selected[index][m]) {
                    backgroundColor = COLORS(1)[index];
                    color = offWhite;
                    if (m === rootIdx) {
                        color = gold;
                        borderColor = brown;
                    }
                }
            } else {
                if (isMatch()) {
                    backgroundColor = noteColor;
                    color = offWhite;
                } else if (note) {
                    backgroundColor = lightGrey;
                }

                if (pegs.includes(m)) {
                    const idx = pegs.indexOf(m);
                    numLabel = m === relMajor[idx] ? "" : "♭";
                    numLabel += `${idx + 1}`;
                }
            }

            const style: CSSProperties = {
                position: "relative",
                display: "float",
                width: `${2 * NOTE_RADIUS}%`,
                height: `${2 * NOTE_RADIUS}%`,
                borderRadius: "50%",
                backgroundColor,
                boxSizing: "border-box",
                border: `1px solid ${borderColor}`,
                top: `${
                    SCALE_RADIUS * (1 - Math.cos((Math.PI * i) / 6)) -
                    2 * NOTE_RADIUS * i
                }%`,
                left: `${SCALE_RADIUS * (1 + Math.sin((Math.PI * i) / 6))}%`,
                cursor: "pointer",
            };

            const numLabelStyle: CSSProperties = {
                color,
                fontSize: "0.7vw",
                textAlign: "center",
                position: "relative",
                top: "50%",
                transform: "translateY(-50%)",
            };

            const refLabel = {
                numbers: m,
                names: NOTE_NAMES[m],
                degrees: numLabel,
            };

            return (
                <div
                    key={m}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(pegs, m);
                    }}
                    style={style}
                >
                    <div style={numLabelStyle}>{refLabel[rootReference]}</div>
                </div>
            );
        });
    };

    const { name: keyName, rootIdx: keyRootIdx } = chordReader(notes);
    const { name: chordName, rootIdx: chordRootIdx } = chordReader(
        selected[index],
    );
    const relMajor = getMajor(keyRootIdx);
    let pegs = getPegs(notes);
    let label: React.JSX.Element[];

    for (let i = 0; i < pegs.length; i++) {
        if (pegs[0] === keyRootIdx) break;
        pegs = rotate(pegs);
    }

    if (isInput) {
        label = chordName
            ? chordName.split(" ").map((piece, i) => {
                  return <p key={i}>{piece}</p>;
              })
            : [];
    } else {
        label = keyName
            ? keyName.split(" ").map((piece, i) => {
                  return <p key={i}>{piece}</p>;
              })
            : [];
    }

    const noteDivs = noteComponents(notes, pegs, relMajor, chordRootIdx);
    const svg = getSVG();

    return (
        <div onClick={() => isInput && onClick(pegs, -1)} style={{ ...style }}>
            <div style={svgContainerStyle}>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    {Array(selected.length)
                        .fill(0)
                        .map((_, i) => {
                            if (svg[i])
                                return (
                                    <polygon
                                        points={svg[i].points}
                                        style={svg[i].style}
                                        key={i}
                                    />
                                );
                        })}
                </svg>
            </div>
            <div style={textStyle}>{label}</div>
            {noteDivs}
        </div>
    );
};
