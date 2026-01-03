import { range } from "lodash";
import {
    ChordNames,
    Dirs,
    NoteNames,
    Orderings,
    PositionType,
    RootReferences,
    SharpNoteNames,
    VertexType,
} from "./types";
import { mod } from "./util";

// SCALE_RADIUS + NOTE_RADIUS === 50
export const SCALE_RADIUS = 41;

export const NOTE_RADIUS = 9;

export const DIRS: Dirs[] = ["TL", "TR", "BL", "BR"];

export const ROOT_REFERENCES: { [key in RootReferences]: string } = {
    numbers: "Numbers",
    degrees: "Scale Degrees",
    names: "Note Names",
};

export const ORDERINGS: { [key in Orderings]: string } = {
    chromatic: "Chromatic",
    fifths: "Fifths",
};

export const C = [
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
];

export const EMPTY = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
];

// export enum NoteNamesEnum {
//     C = "C",
//     Db = "D♭",
//     D = "D",
//     Eb = "E♭",
//     E = "E",
//     F = "F",
//     Gb = "G♭",
//     G = "G",
//     Ab = "A♭",
//     A = "A",
//     Bb = "B♭",
//     B = "B",
// }

export const NOTE_NAMES: NoteNames[] = [
    "C",
    "D♭",
    "D",
    "E♭",
    "E",
    "F",
    "G♭",
    "G",
    "A♭",
    "A",
    "B♭",
    "B",
];

export const SHARP_NOTE_NAMES: SharpNoteNames[] = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
];

export const MAJOR = [2, 2, 1, 2, 2, 2, 1];
export const MELMINOR = [2, 1, 2, 2, 2, 2, 1];
export const HARMAJOR = [2, 2, 1, 2, 1, 3, 1];
export const HARMINOR = [2, 1, 2, 2, 1, 3, 1];
export const NEAPOLITAN = [1, 2, 2, 2, 2, 2, 1];

export const SHAPES: { [key in ChordNames]: number[] } = {
    [ChordNames.majorChord]: [0, 4, 7],
    [ChordNames.minorChord]: [0, 3, 7],
    [ChordNames.augChord]: [0, 4, 8],
    [ChordNames.dimChord]: [0, 3, 6],
    [ChordNames.susChord]: [0, 2, 7],
    [ChordNames.maj7Chord]: [0, 4, 7, 11],
    [ChordNames.min7Chord]: [0, 3, 7, 10],
    [ChordNames.domChord]: [0, 4, 7, 10],
    [ChordNames.min7b5Chord]: [0, 3, 6, 10],
    [ChordNames.dim7Chord]: [0, 3, 6, 9],
    [ChordNames.minMajChord]: [0, 3, 7, 11],
    [ChordNames.majAugChord]: [0, 4, 8, 11],
    [ChordNames.domb5Chord]: [0, 4, 6, 10],
    [ChordNames.domAugChord]: [0, 4, 8, 10],
    [ChordNames.pentaScale]: [0, 2, 4, 7, 9],
    [ChordNames.dimPentaScale]: [0, 3, 6, 8, 10],
    [ChordNames.majorScale]: [0, 2, 4, 5, 7, 9, 11],
    [ChordNames.melMinScale]: [0, 2, 3, 5, 7, 9, 11],
    [ChordNames.harMajScale]: [0, 2, 4, 5, 7, 8, 11],
    [ChordNames.harMinScale]: [0, 2, 3, 5, 7, 8, 11],
    [ChordNames.NeoScale]: [0, 1, 3, 5, 7, 9, 11],
};

// Key Cube Experimental Constants
const PATTERN_MAP: { [key in string]: [number, number, number][] } = {
    [ChordNames.majorScale]: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
    ],
    [ChordNames.melMinScale]: [
        [-1, 0, 0],
        [0, 1, -1],
        [1, 0, 0],
    ],
    [ChordNames.harMinScale]: [
        [-1, -1, 0],
        [-1, 1, -1],
        [1, 0, -1],
    ],
    [ChordNames.harMajScale]: [
        [0, -1, 0],
        [-1, 1, 0],
        [1, 1, -1],
    ],
};

export function keyCubeExperimentalConstants(edgeSize: number): {
    startingPos: PositionType;
    vertices: Record<string, VertexType>;
    positions: Record<string, PositionType[]>;
} {
    const startingPos: PositionType = [
        edgeSize * -30,
        edgeSize * 10,
        edgeSize * 20,
    ];
    const cubeRange = [-2, -1, 0, 1];
    const positions: { [key in string]: PositionType[] } = {};
    const vertices: {
        [key in string]: VertexType;
    } = {};

    for (let i in NOTE_NAMES) {
        // traverse in circle of fifths
        // get positions for every scale vertex and the cube positions for them
        const root = NOTE_NAMES[(7 * +i) % 12];
        const patternIndex = +i % 3;
        const patternDelta = Math.floor(+i / 3);

        for (let name of [
            ChordNames.majorScale,
            ChordNames.melMinScale,
            ChordNames.harMinScale,
            ChordNames.harMajScale,
        ]) {
            const label = `${root}\n${name}`;
            const coordinates = PATTERN_MAP[name][patternIndex];
            const cubePositions = cubeRange.map((k, index) => {
                const key = `${root}-${name}-${index}`;
                const position = coordinates.map((coord, j) => {
                    return (4 * k + (coord + patternDelta)) * edgeSize;
                }) as PositionType;

                vertices[key] = {
                    key,
                    label,
                    root,
                    scaleType: name as ChordNames,
                    position,
                };
                return position;
            });

            if (+i % 3 === 0 && name !== ChordNames.harMajScale) {
                positions[label] = cubePositions;
            }
        }
    }

    return {
        startingPos,
        vertices,
        positions,
    };
}

export function chordCubeExperimentalConstants(edgeSize: number): {
    startingPos: PositionType;
    vertices: Record<string, VertexType>;
    connections: [string, string][];
} {
    const startingPos: PositionType = [
        edgeSize * -30,
        edgeSize * 10,
        edgeSize * 20,
    ];
    const scaleRatio = 0.8;

    function generateVertexLayer(
        offset: number,
        height: number,
        scaleRatio: number,
        rangeIdx: number,
    ): [Record<string, VertexType>, [string, string][]] {
        const twistIdx = Math.floor(rangeIdx / 3);

        const chordNotes = [
            mod(offset, 12),
            mod(offset + 3, 12),
            mod(offset + 6, 12),
            mod(offset + 9, 12),
        ];
        const dimRoots = [
            mod(offset + 1, 12),
            mod(offset + 4, 12),
            mod(offset + 7, 12),
            mod(offset + 11, 12),
        ];

        const getKey = (rootIdx: number, name: ChordNames, idx?: number) => {
            if (idx === undefined) idx = rangeIdx;
            return `${NOTE_NAMES[rootIdx]}-${name}-${idx}`;
        };

        const getVertex = (
            rootIdx: number,
            name: ChordNames,
            position: PositionType,
        ) => {
            const scaledPosition: PositionType = [
                position[0] * edgeSize,
                position[1] * edgeSize,
                position[2] * edgeSize,
            ];
            return {
                key: getKey(rootIdx, name),
                position: scaledPosition,
                scaleType: name,
                root: NOTE_NAMES[rootIdx],
                label: `${NOTE_NAMES[rootIdx]}\n${name}`,
            };
        };

        function maj(rootIdx: number) {
            const third = mod(rootIdx + 4, 12);
            const fifth = mod(rootIdx + 7, 12);
            const seventh = mod(rootIdx + 11, 12);
            return [
                getKey(
                    mod(rootIdx + 1, 12),
                    ChordNames.min7b5Chord,
                    rangeIdx + 1,
                ),
                getKey(rootIdx, ChordNames.minMajChord),
                getKey(rootIdx, ChordNames.majAugChord),
                getKey(rootIdx, ChordNames.domChord),
            ];
        }

        function min(rootIdx: number) {
            const third = mod(rootIdx + 3, 12);
            const fifth = mod(rootIdx + 7, 12);
            const seventh = mod(rootIdx + 10, 12);
            return [
                getKey(
                    mod(rootIdx - 1, 12),
                    ChordNames.majAugChord,
                    rangeIdx - 1,
                ),
                getKey(third, ChordNames.domChord),
                getKey(rootIdx, ChordNames.domChord),
                getKey(rootIdx, ChordNames.min7b5Chord),
                getKey(mod(fifth + 2, 12), ChordNames.min7b5Chord),
                getKey(rootIdx, ChordNames.minMajChord),
            ];
        }

        function dom(rootIdx: number) {
            const third = mod(rootIdx + 4, 12);
            const fifth = mod(rootIdx + 7, 12);
            const seventh = mod(rootIdx + 10, 12);
            return [
                getKey(mod(rootIdx + 1, 12), ChordNames.dimChord),
                getKey(rootIdx, ChordNames.min7Chord),
                getKey(rootIdx, ChordNames.domAugChord),
                getKey(mod(seventh - 1, 12), ChordNames.min7Chord),
                getKey(rootIdx, ChordNames.maj7Chord),
            ];
        }

        function halfDim(rootIdx: number) {
            const third = mod(rootIdx + 3, 12);
            const fifth = mod(rootIdx + 6, 12);
            const seventh = mod(rootIdx + 10, 12);
            return [
                getKey(
                    mod(rootIdx - 1, 12),
                    ChordNames.maj7Chord,
                    rangeIdx - 1,
                ),
                getKey(third, ChordNames.min7Chord),
                getKey(
                    mod(third - 1, 12),
                    ChordNames.domAugChord,
                    rangeIdx - 1,
                ),
                getKey(rootIdx, ChordNames.min7Chord),
                getKey(mod(seventh - 1, 12), ChordNames.dimChord),
            ];
        }

        function minMaj(rootIdx: number) {
            const third = mod(rootIdx + 3, 12);
            const fifth = mod(rootIdx + 7, 12);
            const seventh = mod(rootIdx + 11, 12);
            return [
                getKey(third, ChordNames.domAugChord),
                getKey(rootIdx, ChordNames.maj7Chord),
                getKey(rootIdx, ChordNames.min7Chord),
            ];
        }

        function majAug(rootIdx: number) {
            const third = mod(rootIdx + 4, 12);
            const fifth = mod(rootIdx + 8, 12);
            const seventh = mod(rootIdx + 11, 12);
            return [
                getKey(
                    mod(rootIdx + 1, 12),
                    ChordNames.min7Chord,
                    rangeIdx + 1,
                ),
                getKey(rootIdx, ChordNames.maj7Chord),
                getKey(rootIdx, ChordNames.domAugChord),
            ];
        }

        function domAug(rootIdx: number) {
            const third = mod(rootIdx + 4, 12);
            const fifth = mod(rootIdx + 8, 12);
            const seventh = mod(rootIdx + 10, 12);
            return [
                getKey(seventh, ChordNames.min7b5Chord, rangeIdx + 1),
                getKey(rootIdx, ChordNames.domChord),
                getKey(mod(seventh - 1, 12), ChordNames.minMajChord),
                getKey(rootIdx, ChordNames.majAugChord),
            ];
        }

        function domb5(rootIdx: number) {
            const third = mod(rootIdx + 4, 12);
            const fifth = mod(rootIdx + 6, 12);
            const seventh = mod(rootIdx + 10, 12);
            return [
                getKey(fifth, ChordNames.domChord),
                getKey(rootIdx, ChordNames.min7b5Chord),
                getKey(rootIdx, ChordNames.domChord),
                getKey(fifth, ChordNames.min7b5Chord),
            ];
        }

        function dim(rootIdx: number) {
            const third = mod(rootIdx + 3, 12);
            const fifth = mod(rootIdx + 6, 12);
            const seventh = mod(rootIdx + 9, 12);
            return [
                getKey(mod(rootIdx - 1, 12), ChordNames.domChord),
                getKey(third, ChordNames.min7b5Chord, rangeIdx + 1),
                getKey(mod(third - 1, 12), ChordNames.domChord),
                getKey(fifth, ChordNames.min7b5Chord, rangeIdx + 1),
                getKey(mod(fifth - 1, 12), ChordNames.domChord),
                getKey(seventh, ChordNames.min7b5Chord, rangeIdx + 1),
                getKey(mod(seventh - 1, 12), ChordNames.domChord),
                getKey(rootIdx, ChordNames.min7b5Chord, rangeIdx + 1),
            ];
        }

        const chordFuncs = {
            [ChordNames.maj7Chord]: maj,
            [ChordNames.min7Chord]: min,
            [ChordNames.domChord]: dom,
            [ChordNames.min7b5Chord]: halfDim,
            [ChordNames.minMajChord]: minMaj,
            [ChordNames.majAugChord]: majAug,
            [ChordNames.domAugChord]: domAug,
            [ChordNames.domb5Chord]: domb5,
            [ChordNames.dim7Chord]: dim,
        };

        function generateConnections(
            rootIdx: number,
            chordName: keyof typeof chordFuncs,
        ): [string, string][] {
            const chordFunc = chordFuncs[chordName];
            if (chordFunc) {
                return chordFunc(rootIdx).map((connectedChordKey: string) => {
                    const connection: [string, string] = [
                        getKey(rootIdx, chordName),
                        connectedChordKey,
                    ];
                    connection.sort();
                    return connection;
                });
            }
            return [];
        }

        // the graph twists when repeated vertically
        const a = mod(0 + twistIdx, 4);
        const b = mod(3 + twistIdx, 4);
        const c = mod(2 + twistIdx, 4);
        const d = mod(1 + twistIdx, 4);

        const connections = [
            // Bottom Layer (height + 0)
            ...generateConnections(chordNotes[a], ChordNames.min7b5Chord),
            ...generateConnections(chordNotes[b], ChordNames.min7b5Chord),
            ...generateConnections(chordNotes[c], ChordNames.min7b5Chord),
            ...generateConnections(chordNotes[d], ChordNames.min7b5Chord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.min7Chord),
            ...generateConnections(chordNotes[b], ChordNames.min7Chord),
            ...generateConnections(chordNotes[c], ChordNames.min7Chord),
            ...generateConnections(chordNotes[d], ChordNames.min7Chord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.minMajChord),
            ...generateConnections(chordNotes[b], ChordNames.minMajChord),
            ...generateConnections(chordNotes[c], ChordNames.minMajChord),
            ...generateConnections(chordNotes[d], ChordNames.minMajChord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.domChord),
            ...generateConnections(chordNotes[b], ChordNames.domChord),
            ...generateConnections(chordNotes[c], ChordNames.domChord),
            ...generateConnections(chordNotes[d], ChordNames.domChord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.maj7Chord),
            ...generateConnections(chordNotes[b], ChordNames.maj7Chord),
            ...generateConnections(chordNotes[c], ChordNames.maj7Chord),
            ...generateConnections(chordNotes[d], ChordNames.maj7Chord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.majAugChord),
            ...generateConnections(chordNotes[b], ChordNames.majAugChord),
            ...generateConnections(chordNotes[c], ChordNames.majAugChord),
            ...generateConnections(chordNotes[d], ChordNames.majAugChord),
            // ...
            ...generateConnections(dimRoots[a], ChordNames.dim7Chord),
            ...generateConnections(dimRoots[b], ChordNames.dim7Chord),
            ...generateConnections(dimRoots[c], ChordNames.dim7Chord),
            ...generateConnections(dimRoots[d], ChordNames.dim7Chord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.domAugChord),
            ...generateConnections(chordNotes[b], ChordNames.domAugChord),
            ...generateConnections(chordNotes[c], ChordNames.domAugChord),
            ...generateConnections(chordNotes[d], ChordNames.domAugChord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.domb5Chord),
            ...generateConnections(chordNotes[b], ChordNames.domb5Chord),
            ...generateConnections(chordNotes[c], ChordNames.domb5Chord),
            ...generateConnections(chordNotes[d], ChordNames.domb5Chord),
        ];

        return [
            {
                // Bottom Layer (height + 0)
                [getKey(chordNotes[a], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.min7b5Chord,
                    [1, height * scaleRatio, 2],
                ),
                [getKey(chordNotes[b], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.min7b5Chord,
                    [2, height * scaleRatio, 1],
                ),
                [getKey(chordNotes[c], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.min7b5Chord,
                    [3, height * scaleRatio, 2],
                ),
                [getKey(chordNotes[d], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.min7b5Chord,
                    [2, height * scaleRatio, 3],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.min7Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.min7Chord,
                    [1, (height + 1) * scaleRatio, 1],
                ),
                [getKey(chordNotes[b], ChordNames.min7Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.min7Chord,
                    [3, (height + 1) * scaleRatio, 1],
                ),
                [getKey(chordNotes[c], ChordNames.min7Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.min7Chord,
                    [3, (height + 1) * scaleRatio, 3],
                ),
                [getKey(chordNotes[d], ChordNames.min7Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.min7Chord,
                    [1, (height + 1) * scaleRatio, 3],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.minMajChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.minMajChord,
                    [0, (height + 2) * scaleRatio, 1],
                ),
                [getKey(chordNotes[b], ChordNames.minMajChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.minMajChord,
                    [3, (height + 2) * scaleRatio, 0],
                ),
                [getKey(chordNotes[c], ChordNames.minMajChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.minMajChord,
                    [4, (height + 2) * scaleRatio, 3],
                ),
                [getKey(chordNotes[d], ChordNames.minMajChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.minMajChord,
                    [1, (height + 2) * scaleRatio, 4],
                ),
                //...
                [getKey(chordNotes[a], ChordNames.domChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.domChord,
                    [2, (height + 2) * scaleRatio, 1],
                ),
                [getKey(chordNotes[b], ChordNames.domChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.domChord,
                    [3, (height + 2) * scaleRatio, 2],
                ),
                [getKey(chordNotes[c], ChordNames.domChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.domChord,
                    [2, (height + 2) * scaleRatio, 3],
                ),
                [getKey(chordNotes[d], ChordNames.domChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.domChord,
                    [1, (height + 2) * scaleRatio, 2],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.maj7Chord,
                    [1, (height + 3) * scaleRatio, 1],
                ),
                [getKey(chordNotes[b], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.maj7Chord,
                    [3, (height + 3) * scaleRatio, 1],
                ),
                [getKey(chordNotes[c], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.maj7Chord,
                    [3, (height + 3) * scaleRatio, 3],
                ),
                [getKey(chordNotes[d], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.maj7Chord,
                    [1, (height + 3) * scaleRatio, 3],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.majAugChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.majAugChord,
                    [1, (height + 4) * scaleRatio, 0],
                ),
                [getKey(chordNotes[b], ChordNames.majAugChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.majAugChord,
                    [4, (height + 4) * scaleRatio, 1],
                ),
                [getKey(chordNotes[c], ChordNames.majAugChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.majAugChord,
                    [3, (height + 4) * scaleRatio, 4],
                ),
                [getKey(chordNotes[d], ChordNames.majAugChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.majAugChord,
                    [0, (height + 4) * scaleRatio, 3],
                ),
                // ...
                [getKey(dimRoots[a], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[a],
                    ChordNames.dim7Chord,
                    [2, (height + 3) * scaleRatio, 2],
                ),
                [getKey(dimRoots[b], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[b],
                    ChordNames.dim7Chord,
                    [2, (height + 3) * scaleRatio, 2],
                ),
                [getKey(dimRoots[c], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[c],
                    ChordNames.dim7Chord,
                    [2, (height + 3) * scaleRatio, 2],
                ),
                [getKey(dimRoots[d], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[d],
                    ChordNames.dim7Chord,
                    [2, (height + 3) * scaleRatio, 2],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.domAugChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.domAugChord,
                    [2, (height + 3) * scaleRatio, 0],
                ),
                [getKey(chordNotes[b], ChordNames.domAugChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.domAugChord,
                    [4, (height + 3) * scaleRatio, 2],
                ),
                [getKey(chordNotes[c], ChordNames.domAugChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.domAugChord,
                    [2, (height + 3) * scaleRatio, 4],
                ),
                [getKey(chordNotes[d], ChordNames.domAugChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.domAugChord,
                    [0, (height + 3) * scaleRatio, 2],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.domb5Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.domb5Chord,
                    [2, (height + 1) * scaleRatio, 2],
                ),
                [getKey(chordNotes[b], ChordNames.domb5Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.domb5Chord,
                    [2, (height + 1) * scaleRatio, 2],
                ),
                [getKey(chordNotes[c], ChordNames.domb5Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.domb5Chord,
                    [2, (height + 1) * scaleRatio, 2],
                ),
                [getKey(chordNotes[d], ChordNames.domb5Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.domb5Chord,
                    [2, (height + 1) * scaleRatio, 2],
                ),
            },
            connections,
        ];
    }

    // marshall everything together
    let allConnections: [string, string][] = [];
    let vertices: Record<string, VertexType> = {};
    for (let i of [-1, 0]) {
        const [firstVertexLayer, firstConnections] = generateVertexLayer(
            0, // root offset (only need 0-1-2) aka (C, C# D)
            i * 12 + 0, // height on y-axis (0, 4, 8...)
            scaleRatio, // sandwhich the height
            i * 3 + 0, // layer number (0, 1, 2)
        );
        const [secondVertexLayer, secondConnections] = generateVertexLayer(
            1,
            i * 12 + 4,
            scaleRatio,
            i * 3 + 1,
        );
        const [thirdVertexLayer, thirdConnections] = generateVertexLayer(
            2,
            i * 12 + 8,
            scaleRatio,
            i * 3 + 2,
        );

        vertices = {
            ...vertices,
            ...firstVertexLayer,
            ...secondVertexLayer,
            ...thirdVertexLayer,
        };
        allConnections.push(
            ...firstConnections,
            ...secondConnections,
            ...thirdConnections,
        );
    }

    // remove duplicate allConnections
    const uniqueConnections = new Set(
        allConnections.map((pair) => JSON.stringify(pair)),
    );
    allConnections = Array.from(uniqueConnections).map((str) =>
        JSON.parse(str),
    );

    return {
        startingPos,
        vertices,
        connections: allConnections,
    };
}
