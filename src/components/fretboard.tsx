import React, { CSSProperties, useState } from "react";
import isEqual from "lodash/isEqual";
import { NOTE_NAMES } from "../consts";
import { COLORS, lightGrey, mediumGrey } from "../colors";
import {
    rotate,
    dup,
    getOctaveFrets,
    inRange,
    bStringStep,
    getLabelColors,
} from "../util";
import { NoteNames } from "../store2/types";

const buttonStyle: CSSProperties = {
    padding: "5px",
    backgroundColor: lightGrey,
    borderRadius: "3px",
    margin: "5px",
    textAlign: "center",
    minWidth: "60px",
    fontSize: "0.8rem",
};

const byString = (a: number[], b: number[]) => {
    if (b[0] == a[0]) return b[1] - a[1];
    return b[0] - a[0];
};

interface FretBoardProps {
    selected: boolean[][];
    style: CSSProperties;
}

type ChordGroupsType = Partial<Record<NoteNames, [number, number][][]>>;
type PointGroupsType = Partial<Record<NoteNames, string[]>>;

export const FretBoard: React.FC<FretBoardProps> = ({ selected, style }) => {
    const [chordGroups, setChordGroups] = useState<ChordGroupsType>({});
    const [previewPoints, setPreviewPoints] = useState<[number, number][]>([]);
    const [currentGroup, setCurrentGroup] = useState<NoteNames | null>(null);

    function getCurrentChordGroup(): [number, number][][] {
        return (currentGroup && chordGroups[currentGroup]) || [];
    }

    const fretComponents = () => {
        const fretDivs: React.JSX.Element[] = [];
        const clickHandlers: React.JSX.Element[] = [];
        const colors = getLabelColors(selected, false);
        const eString = rotate([...NOTE_NAMES], 5);

        const strings: NoteNames[][] = Array(6)
            .fill(0)
            .map((_, i) => {
                const times = i > 3 ? 5 * i - 1 : 5 * i;
                let string = rotate([...eString], times);
                string = string.concat(string.slice(0, 4));
                return string;
            })
            .reverse();

        strings.forEach((noteNames, i) => {
            noteNames.forEach((name, j) => {
                const fretStyle: CSSProperties = {
                    boxShadow: "0px 0px 0px 2px #777",
                    height: "100%",
                    color: colors[name].color,
                    background: colors[name].background,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1vw",
                };

                const onClick = () => {
                    const groups = dup(chordGroups);
                    let chords = getCurrentChordGroup();
                    let current: NoteNames | null = currentGroup;
                    let previewPoints: [number, number][] = [];
                    let handled = false;

                    // first click of chordGroup, get octaves and escape
                    //shouldnt have to check length here but being safe
                    if (!current || !chords.length) {
                        groups[name] = [];
                        current = name;
                        chords = getOctaveFrets([i, j]);
                        handled = true;
                    }

                    // subsequent click, check that we aren't unclicking or replacing another click and escape
                    let activeChord = chords[0];

                    if (!handled) {
                        for (let k = 0; k < activeChord.length; k++) {
                            if (isEqual(activeChord[k], [i, j])) {
                                //clicked on same fret
                                chords = chords.map((chord) =>
                                    chord
                                        .slice(0, k)
                                        .concat(chord.slice(k + 1)),
                                );
                                if (chords.every((chord) => !chord.length)) {
                                    delete groups[current];
                                    current = null;
                                }
                                handled = true;
                                break;
                            } else if (activeChord[k][0] === i) {
                                // clicked on same string as fret, find fret difference
                                chords = chords.map((chord) => {
                                    chord[k][1] += j - activeChord[k][1];
                                    return chord;
                                });
                                if (k === 0) {
                                    groups[name] = groups[current];
                                    delete groups[current];
                                    current = name;
                                }
                                handled = true;
                                break;
                            }
                        }
                    }

                    // adding a fret to all chords in group
                    if (!handled) {
                        if (activeChord[0][0] < i && current) {
                            groups[name] = groups[current];
                            delete groups[current];
                            current = name;
                        }
                        let last = activeChord[activeChord.length - 1];
                        let step = bStringStep(last[0], i);
                        let delta = [i - last[0], j - last[1] - step];
                        let nextString, nextFret;

                        chords.forEach((chord) => {
                            last = chord[chord.length - 1];
                            nextString = last[0] + delta[0];
                            step = bStringStep(last[0], nextString);
                            nextFret = last[1] + delta[1] + step;
                            chord.push([nextString, nextFret]);
                            chord.sort(byString);
                        });
                    }

                    if (current) groups[current] = chords;

                    setChordGroups(groups);
                    setPreviewPoints(previewPoints);
                    setCurrentGroup(current);
                };

                const onMouseEnter = () => {
                    let chords = getCurrentChordGroup();
                    if (!chords.length) return;
                    let points = dup(chords[0]);
                    let previewPoints: [number, number][] = [];

                    if (points[points.length - 1][0] > i) {
                        previewPoints = [points[points.length - 1], [i, j]];
                        setPreviewPoints(previewPoints);
                        return;
                    } else if (points[0][0] < i) {
                        previewPoints = [[i, j], points[0]];
                        setPreviewPoints(previewPoints);
                        return;
                    }

                    for (let idx = 0; idx < points.length; idx++) {
                        if (isEqual(points[idx], [i, j])) {
                            setPreviewPoints(previewPoints);
                            return;
                        } else if (
                            points[idx][0] === i &&
                            points[idx][1] !== j
                        ) {
                            if (idx - 1 >= 0)
                                previewPoints.push(points[idx - 1]);
                            previewPoints.push([i, j]);
                            if (idx + 1 <= 5 && points[idx + 1])
                                previewPoints.push(points[idx + 1]);
                            setPreviewPoints(previewPoints);
                            return;
                        }
                    }

                    points.push([i, j]);
                    points.sort(byString);
                    const idx = points.findIndex((point) => point[0] === i);
                    if (idx - 1 >= 0) previewPoints.push(points[idx - 1]);
                    if (idx >= 0) previewPoints.push([i, j]);
                    if (idx + 1 <= 5 && points[idx + 1])
                        previewPoints.push(points[idx + 1]);
                    setPreviewPoints(previewPoints);
                };

                const onMouseLeave = () => {
                    setPreviewPoints([]);
                };

                fretDivs.push(
                    <div
                        key={`fret-${noteNames.length * i + j}`}
                        style={fretStyle}
                    >
                        {name}
                    </div>,
                );

                clickHandlers.push(
                    <div
                        key={`handler-${noteNames.length * i + j}`}
                        style={{ height: "100%" }}
                        onClick={onClick}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    />,
                );
            });
        });

        return { fretDivs, clickHandlers };
    };

    const getPoints = (points: [number, number][]) => {
        if (!points.length || points.some((point) => !inRange(point)))
            return "";
        return points
            .map((point) =>
                point ? `${point[1] * 100 + 50},${point[0] * 33 + 16.5}` : "",
            )
            .join(" ");
    };

    const removeGroup = (name: NoteNames) => {
        let current = currentGroup;
        let groups = { ...chordGroups };
        current = null;
        delete groups[name];

        setChordGroups(groups);
        setCurrentGroup(current);
    };

    const clearPoints = () => {
        setChordGroups({});
        setPreviewPoints([]);
        setCurrentGroup(null);
    };

    const { fretDivs, clickHandlers } = fretComponents();
    const pointGroups: PointGroupsType = {};
    Object.keys(chordGroups).forEach((key: NoteNames) => {
        pointGroups[key] = chordGroups[key]
            ? chordGroups[key].map((chord) => getPoints(chord))
            : [];
    });

    const fretboardStyle: CSSProperties = Object.assign({}, style, {
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(16, 1fr)",
    });

    const clickHandlerStyle: CSSProperties = {
        ...fretboardStyle,
        zIndex: 60,
        marginBottom: `-${style.height}`,
    };

    const svgContainerStyle: CSSProperties = {
        position: "absolute",
        float: "left",
        height: "100%",
        width: "100%",
        zIndex: 50,
        top: 0,
        left: 0,
    };

    const previewLineStyle: CSSProperties = {
        stroke: "yellow",
        strokeWidth: "3",
        fill: "none",
        strokeDasharray: "5,5",
        strokeLinecap: "round",
    };

    const chooseButtonStyle: CSSProperties = Object.assign({}, buttonStyle, {
        color: mediumGrey,
        display: "flex",
        alignItems: "center",
        minWidth: "unset",
    });

    return (
        <div>
            <div style={clickHandlerStyle}>{clickHandlers}</div>
            <div style={fretboardStyle}>
                <div style={svgContainerStyle}>
                    <svg width="100%" height="100%" viewBox="0 0 1600 198">
                        {Object.keys(chordGroups).map(
                            (key: NoteNames, i: number) => {
                                const chords = chordGroups[key] || [];
                                const points = pointGroups[key] || [];

                                return chords.map((chord, j) => (
                                    <polyline
                                        key={`line-${i}-${j}`}
                                        style={{
                                            stroke: "orange",
                                            // stroke: COLORS(j ? 0.7 : 0.8)[i],
                                            strokeWidth: "4",
                                            strokeLinecap: "round",
                                            fill: "none",
                                        }}
                                        points={points[j]}
                                    />
                                ));
                            },
                        )}
                        {Object.keys(chordGroups).map(
                            (key: NoteNames, i: number) => {
                                const chords = chordGroups[key] || [];
                                return chords.map((chord, j) => {
                                    const center = chord[0];
                                    return (
                                        center && (
                                            <circle
                                                key={`circle-${i}-${j}`}
                                                cx={`${center[1] * 100 + 50}`}
                                                cy={`${center[0] * 33 + 16}`}
                                                r="13"
                                                stroke={COLORS(0.7)[i]}
                                                strokeWidth="3"
                                                fill={COLORS(0.2)[i]}
                                            />
                                        )
                                    );
                                });
                            },
                        )}
                        <polyline
                            style={previewLineStyle}
                            points={getPoints(previewPoints)}
                        />
                    </svg>
                </div>
                {fretDivs}
            </div>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    paddingBottom: "20px",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex" }}>
                    {Object.keys(chordGroups).map(
                        (name: NoteNames, i: number) => {
                            const chordButtonStyle = Object.assign(
                                {},
                                buttonStyle,
                                {
                                    backgroundColor: COLORS(0.5)[i],
                                    display: "flex",
                                    alignItems: "center",
                                    minWidth: "unset",
                                    border:
                                        currentGroup === name
                                            ? "2px solid yellow"
                                            : "2px solid brown",
                                },
                            );

                            return (
                                <button
                                    key={`chord-button-${i}`}
                                    style={chordButtonStyle}
                                    onClick={() => setCurrentGroup(name)}
                                >
                                    <span
                                        style={{
                                            paddingRight: "40px",
                                            fontSize: "0.7rem",
                                        }}
                                    >
                                        {name}
                                    </span>
                                    <span
                                        // name={name}
                                        style={{
                                            color: mediumGrey,
                                            fontSize: "1rem",
                                            lineHeight: "1rem",
                                        }}
                                        onClick={() => removeGroup(name)}
                                    >
                                        &times;
                                    </span>
                                </button>
                            );
                        },
                    )}

                    {!currentGroup ? (
                        <button style={chooseButtonStyle}>
                            <span
                                style={{
                                    paddingRight: "10px",
                                    fontSize: "0.7rem",
                                }}
                            >
                                Choose A Root Note
                            </span>
                            <span
                                // name={name}
                                style={{
                                    color: mediumGrey,
                                    fontSize: "1rem",
                                    lineHeight: "1rem",
                                }}
                            >
                                &times;
                            </span>
                        </button>
                    ) : (
                        <button
                            style={buttonStyle}
                            onClick={() => setCurrentGroup(null)}
                        >
                            New Chord
                        </button>
                    )}
                </div>
                <div>
                    <button style={buttonStyle} onClick={clearPoints}>
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FretBoard;
