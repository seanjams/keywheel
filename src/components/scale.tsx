import React, { CSSProperties } from "react";
import { AppStore } from "../store/state";
import { useDerivedState } from "../store/hooks";
import {
    darkGrey,
    lightGrey,
    offWhite,
    gold,
    brown,
    transparent,
    COLORS,
    NOTE_RADIUS,
    SCALE_RADIUS,
    SVG_OPACITY,
    NOTE_NAMES,
    SHARP_NOTE_NAMES,
    getPegs,
    chordReader,
    rotate,
    soundNotes,
    getMajor,
    mod,
    getScaledPolygonPoints,
} from "../util";

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
    isInput: boolean; //bool for styling svg and event handlers of input type scales
    index: number; //int for color index of input type scales
    style: CSSProperties; // scale container style
    handleClick?: (i: number) => void;
    appStore: AppStore;
}

export const Scale: React.FC<ScaleProps> = ({
    appStore,
    notes,
    index,
    isInput,
    style,
    handleClick,
}) => {
    const [getState] = useDerivedState(
        appStore,
        ({
            selected,
            mute,
            rootReference,
            ordering,
            normalizedPolygonPoints,
        }) => ({
            selected,
            normalizedPolygonPoints,
            mute,
            rootReference,
            ordering,
        }),
    );
    const { selected, mute, rootReference, ordering, normalizedPolygonPoints } =
        getState();

    const getSVG = () => {
        if (isInput) {
            if (index >= 0) {
                const style: CSSProperties = {
                    stroke: lightGrey,
                    strokeWidth: 1,
                    fill: COLORS(SVG_OPACITY)[index],
                };

                return [
                    {
                        points: getScaledPolygonPoints(
                            normalizedPolygonPoints[index],
                            "svg",
                            SCALE_RADIUS,
                            NOTE_RADIUS,
                        )
                            .map(([x, y]) => `${x},${y}`)
                            .join(" "),
                        style,
                    },
                ];
            }
        }

        return normalizedPolygonPoints.map((points, i) => {
            if (!points.length) return null;

            const pegs = getPegs(selected[i]);
            const isMatch = pegs.every((j) => notes[j]);
            if (!isMatch || !pegs.length) return null;

            const style: CSSProperties = {
                stroke: lightGrey,
                strokeWidth: 1,
                fill: COLORS(SVG_OPACITY)[i],
            };

            return {
                points: getScaledPolygonPoints(
                    points,
                    "svg",
                    SCALE_RADIUS,
                    NOTE_RADIUS,
                )
                    .map(([x, y]) => `${x},${y}`)
                    .join(" "),
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
        isSharpKey: boolean,
        selectedChordRootIdx = -1,
    ) => {
        return notes.map((note: boolean, i: number) => {
            let noteIndex = ordering === "fifths" ? mod(7 * i, 12) : i;
            let color = darkGrey;
            let borderColor = darkGrey;
            let backgroundColor = transparent;
            let degreeLabel: string = "";

            if (isInput) {
                // inputs should show note name for degree label
                degreeLabel = NOTE_NAMES[noteIndex];
                if (selected[index][noteIndex]) {
                    backgroundColor = COLORS(1)[index];
                    color = offWhite;
                    if (noteIndex === selectedChordRootIdx) {
                        color = gold;
                        borderColor = brown;
                    }
                }
            } else {
                let noteColor: string = "";
                const isMatch = () =>
                    selected.some((arr, j) => {
                        let arrPegs = getPegs(arr);
                        const match =
                            arr[noteIndex] &&
                            arrPegs.length > 0 &&
                            arrPegs.every((k) => notes[k]);
                        if (match && !noteColor) noteColor = COLORS(1)[j];
                        return match;
                    });

                if (isMatch()) {
                    backgroundColor = noteColor;
                    color = offWhite;
                } else if (notes[noteIndex]) {
                    backgroundColor = lightGrey;
                }

                if (pegs.includes(noteIndex)) {
                    const idx = pegs.indexOf(noteIndex);
                    degreeLabel = noteIndex === relMajor[idx] ? "" : "♭";
                    degreeLabel += `${idx + 1}`;
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
                numbers: noteIndex,
                names: isSharpKey
                    ? SHARP_NOTE_NAMES[noteIndex]
                    : NOTE_NAMES[noteIndex],
                degrees: degreeLabel,
            };

            return (
                <div
                    key={noteIndex}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(pegs, noteIndex);
                    }}
                    style={style}
                >
                    <div style={numLabelStyle}>{refLabel[rootReference]}</div>
                </div>
            );
        });
    };

    const { rootIdx: scaleRootIdx, scaleType } = chordReader(notes);
    const { rootIdx: chordRootIdx, scaleType: chordType } = chordReader(
        selected[index],
    );
    const relMajor = getMajor(scaleRootIdx);
    const isSharpKey = [7, 2, 9, 4, 11, 6].includes(scaleRootIdx);
    const keyName =
        scaleRootIdx > -1
            ? `${isSharpKey ? SHARP_NOTE_NAMES[scaleRootIdx] : NOTE_NAMES[scaleRootIdx]} ${scaleType}`
            : "";
    const chordName =
        chordRootIdx > -1 ? `${NOTE_NAMES[chordRootIdx]} ${chordType}` : "";
    let pegs = getPegs(notes);
    let label: React.JSX.Element[];

    for (let i = 0; i < pegs.length; i++) {
        if (pegs[0] === scaleRootIdx) break;
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

    const noteDivs = noteComponents(
        notes,
        pegs,
        relMajor,
        isSharpKey,
        chordRootIdx,
    );
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
