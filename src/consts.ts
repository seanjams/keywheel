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

export const NOTE_NAMES: NoteNames[] = [
    NoteNames.C,
    NoteNames.Db,
    NoteNames.D,
    NoteNames.Eb,
    NoteNames.E,
    NoteNames.F,
    NoteNames.Gb,
    NoteNames.G,
    NoteNames.Ab,
    NoteNames.A,
    NoteNames.Bb,
    NoteNames.B,
];

export const SHARP_NOTE_NAMES: SharpNoteNames[] = [
    SharpNoteNames.C,
    SharpNoteNames.Cs,
    SharpNoteNames.D,
    SharpNoteNames.Ds,
    SharpNoteNames.E,
    SharpNoteNames.F,
    SharpNoteNames.Fs,
    SharpNoteNames.G,
    SharpNoteNames.Gs,
    SharpNoteNames.A,
    SharpNoteNames.As,
    SharpNoteNames.B,
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

export function keyCubeExperimentalConstants(edgeSize: number): {
    startingPos: PositionType;
    vertices: Record<string, VertexType>;
    connections: [string, string][];
} {
    const startingPos: PositionType = [
        edgeSize * -30,
        edgeSize * 10,
        edgeSize * 20,
    ];
    const positions: Record<string, PositionType[]> = {};
    const vertices: Record<string, VertexType> = {};

    type scaleTypes =
        | ChordNames.majorScale
        | ChordNames.melMinScale
        | ChordNames.harMinScale
        | ChordNames.harMajScale;

    // Key Cube Experimental Constants
    const patternMap: Record<scaleTypes, PositionType[]> = {
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

    const getKey = (rootIdx: number, name: scaleTypes, layerIdx: number) => {
        const root = NOTE_NAMES[mod(rootIdx, 12)];
        return `${root}-${name}-${layerIdx}`;
    };

    function majorScale(rootIdx: number, layerIdx: number) {
        const [root, second, third, fourth, fifth, sixth, seventh] = SHAPES[
            ChordNames.majorScale
        ].map((peg) => mod(peg + rootIdx, 12));
        const backwardMajorOffset = root === 0 ? -1 : 0;
        const forwardMajorOffset = root === 5 ? 1 : 0;
        const melMinorOffset = root === 10 || root === 5 ? 1 : 0;
        const harMinOffset = root === 3 || root === 10 || root === 5 ? 1 : 0;

        return [
            getKey(root, ChordNames.melMinScale, layerIdx),
            getKey(root, ChordNames.harMajScale, layerIdx),
            getKey(second, ChordNames.melMinScale, layerIdx + melMinorOffset),
            getKey(
                fourth,
                ChordNames.majorScale,
                layerIdx + backwardMajorOffset,
            ),
            getKey(fifth, ChordNames.majorScale, layerIdx + forwardMajorOffset),
            getKey(sixth, ChordNames.harMinScale, layerIdx + harMinOffset),
        ];
    }

    function melMinScale(rootIdx: number, layerIdx: number) {
        const [root, second, third, fourth, fifth, sixth, seventh] = SHAPES[
            ChordNames.melMinScale
        ].map((peg) => mod(peg + rootIdx, 12));
        const majorOffset = root === 0 || root === 7 ? -1 : 0;
        const harMajOffset = root === 5 ? 1 : 0;
        return [
            getKey(root, ChordNames.majorScale, layerIdx),
            getKey(root, ChordNames.harMinScale, layerIdx),
            getKey(fifth, ChordNames.harMajScale, layerIdx + harMajOffset),
            getKey(seventh - 1, ChordNames.majorScale, layerIdx + majorOffset),
        ];
    }

    function harMinScale(rootIdx: number, layerIdx: number) {
        const [root, second, third, fourth, fifth, sixth, seventh] = SHAPES[
            ChordNames.harMinScale
        ].map((peg) => mod(peg + rootIdx, 12));
        const majorOffset = root === 0 || root === 7 || root === 2 ? -1 : 0;

        return [
            getKey(root, ChordNames.melMinScale, layerIdx),
            getKey(root, ChordNames.harMajScale, layerIdx),
            getKey(third, ChordNames.majorScale, layerIdx + majorOffset),
        ];
    }

    function harMajScale(rootIdx: number, layerIdx: number) {
        const [root, second, third, fourth, fifth, sixth, seventh] = SHAPES[
            ChordNames.harMajScale
        ].map((peg) => mod(peg + rootIdx, 12));
        const melMinOffset = root === 0 ? -1 : 0;
        return [
            getKey(root, ChordNames.majorScale, layerIdx),
            getKey(root, ChordNames.harMinScale, layerIdx),
            getKey(fourth, ChordNames.melMinScale, layerIdx + melMinOffset),
        ];
    }

    const scaleFuncs: Record<
        scaleTypes,
        (rootIdx: number, layerIdx: number) => string[]
    > = {
        [ChordNames.majorScale]: majorScale,
        [ChordNames.melMinScale]: melMinScale,
        [ChordNames.harMinScale]: harMinScale,
        [ChordNames.harMajScale]: harMajScale,
    };

    function generateConnections(
        rootIdx: number,
        chordName: keyof typeof scaleFuncs,
        layerIdx: number,
    ): [string, string][] {
        const scaleFunc = scaleFuncs[chordName];
        return scaleFunc(rootIdx, layerIdx).map((connectedScaleKey: string) => {
            const connection: [string, string] = [
                getKey(rootIdx, chordName, layerIdx),
                connectedScaleKey,
            ];
            connection.sort();
            return connection;
        });
    }

    let allConnections: [string, string][] = [];

    for (let i in NOTE_NAMES) {
        // traverse in circle of fifths
        // get positions for every scale vertex and the connections for them
        const rootIdx = mod(7 * +i, 12);
        const patternIdx = mod(+i, 3);
        const patternDelta = Math.floor(+i / 3);

        for (let chordName of [
            ChordNames.majorScale,
            ChordNames.melMinScale,
            ChordNames.harMinScale,
            ChordNames.harMajScale,
        ] as scaleTypes[]) {
            const root = NOTE_NAMES[rootIdx];
            const label = `${root}\n${chordName}`;
            const coordinates = patternMap[chordName][patternIdx];
            for (let layerIdx of [-2, -1, 0, 1]) {
                const key = getKey(rootIdx, chordName, layerIdx);
                const connections = generateConnections(
                    rootIdx,
                    chordName,
                    layerIdx,
                );
                const position = coordinates.map((coord) => {
                    return (4 * layerIdx + (coord + patternDelta)) * edgeSize;
                }) as PositionType;

                allConnections.push(...connections);
                vertices[key] = {
                    key,
                    label,
                    alternativeKeys: [],
                    layerIdx,
                    rootIdx,
                    root,
                    scaleType: chordName,
                    position,
                    hidden: false,
                };
            }
        }
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
    const heightRatio = 0.8;

    function generateVertexLayer(
        noteName: NoteNames,
        height: number,
        layerIdx: number,
    ): [Record<string, VertexType>, [string, string][]] {
        const offset = mod(NOTE_NAMES.indexOf(noteName), 3);
        const twistIdx = Math.floor(layerIdx / 3);

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
            mod(offset + 10, 12),
        ];
        const augRoots = [
            mod(offset - 1, 12),
            mod(offset + 2, 12),
            mod(offset + 5, 12),
            mod(offset + 8, 12),
        ];
        const domb5Roots = [
            mod(offset, 12), // order matters, needs to be opposite of +6
            mod(offset + 3, 12),
            mod(offset + 6, 12),
            mod(offset + 9, 12),
        ];

        const getKey = (rootIdx: number, name: ChordNames, layer?: number) => {
            if (layer === undefined) layer = layerIdx;
            const root = NOTE_NAMES[mod(rootIdx, 12)];
            return `${root}-${name}-${layer}`;
        };

        const getVertex = (
            rootIdx: number,
            chordName: ChordNames,
            position: PositionType,
        ) => {
            const scaledPosition: PositionType = [
                position[0] * edgeSize,
                (height + position[1]) * heightRatio * edgeSize,
                position[2] * edgeSize,
            ];

            const alternativeKeys = [];
            if (
                chordName === ChordNames.domb5Chord ||
                chordName === ChordNames.dim7Chord
            ) {
                alternativeKeys.push(
                    getKey(mod(rootIdx + 3, 12), chordName, layerIdx),
                    getKey(mod(rootIdx + 6, 12), chordName, layerIdx),
                    getKey(mod(rootIdx + 9, 12), chordName, layerIdx),
                );
            }

            return {
                key: getKey(rootIdx, chordName, layerIdx),
                alternativeKeys,
                label: `${NOTE_NAMES[rootIdx]}\n${chordName}`,
                layerIdx,
                rootIdx,
                root: NOTE_NAMES[rootIdx],
                scaleType: chordName,
                position: scaledPosition,
                hidden: false,
            };
        };

        function maj7Chord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.maj7Chord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(root + 1, ChordNames.min7b5Chord, layerIdx + 1),
                getKey(root, ChordNames.minMajChord, layerIdx),
                getKey(root, ChordNames.majAugChord, layerIdx),
                getKey(root, ChordNames.domChord, layerIdx),
            ];
        }

        function min7Chord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.min7Chord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(root - 1, ChordNames.majAugChord, layerIdx - 1),
                getKey(third, ChordNames.domChord, layerIdx),
                getKey(root, ChordNames.domChord, layerIdx),
                getKey(root, ChordNames.min7b5Chord, layerIdx),
                getKey(fifth + 2, ChordNames.min7b5Chord, layerIdx),
                getKey(root, ChordNames.minMajChord, layerIdx),
            ];
        }

        function domChord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.domChord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(root + 1, ChordNames.dimChord, layerIdx),
                getKey(root, ChordNames.min7Chord, layerIdx),
                getKey(root, ChordNames.domAugChord, layerIdx),
                getKey(seventh - 1, ChordNames.min7Chord, layerIdx),
                getKey(root, ChordNames.maj7Chord, layerIdx),
            ];
        }

        function min7b5Chord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.min7b5Chord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(root - 1, ChordNames.maj7Chord, layerIdx - 1),
                getKey(third, ChordNames.min7Chord, layerIdx),
                getKey(third - 1, ChordNames.domAugChord, layerIdx - 1),
                getKey(root, ChordNames.min7Chord, layerIdx),
                getKey(seventh - 1, ChordNames.dimChord, layerIdx),
            ];
        }

        function minMajChord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.minMajChord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(third, ChordNames.domAugChord, layerIdx),
                getKey(root, ChordNames.maj7Chord, layerIdx),
                getKey(root, ChordNames.min7Chord, layerIdx),
                getKey(seventh, ChordNames.augChord, layerIdx),
            ];
        }

        function majAugChord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.majAugChord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(root + 1, ChordNames.min7Chord, layerIdx + 1),
                getKey(root, ChordNames.maj7Chord, layerIdx),
                getKey(root, ChordNames.domAugChord, layerIdx),
                getKey(root, ChordNames.augChord, layerIdx),
            ];
        }

        function domAugChord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.domAugChord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(seventh, ChordNames.min7b5Chord, layerIdx + 1),
                getKey(root, ChordNames.domChord, layerIdx),
                getKey(seventh - 1, ChordNames.minMajChord, layerIdx),
                getKey(root, ChordNames.majAugChord, layerIdx),
            ];
        }

        function domb5Chord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.domb5Chord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(fifth, ChordNames.domChord, layerIdx),
                getKey(root, ChordNames.min7b5Chord, layerIdx),
                getKey(root, ChordNames.domChord, layerIdx),
                getKey(fifth, ChordNames.min7b5Chord, layerIdx),
            ];
        }

        function dim7Chord(rootIdx: number) {
            const [root, third, fifth, seventh] = SHAPES[
                ChordNames.dim7Chord
            ].map((peg) => mod(peg + rootIdx, 12));
            return [
                getKey(root - 1, ChordNames.domChord, layerIdx),
                getKey(third, ChordNames.min7b5Chord, layerIdx + 1),
                getKey(third - 1, ChordNames.domChord, layerIdx),
                getKey(fifth, ChordNames.min7b5Chord, layerIdx + 1),
                getKey(fifth - 1, ChordNames.domChord, layerIdx),
                getKey(seventh, ChordNames.min7b5Chord, layerIdx + 1),
                getKey(seventh - 1, ChordNames.domChord, layerIdx),
                getKey(root, ChordNames.min7b5Chord, layerIdx + 1),
            ];
        }

        function augChord(rootIdx: number) {
            const [root, third, fifth] = SHAPES[ChordNames.augChord].map(
                (peg) => mod(peg + rootIdx, 12),
            );
            return [
                getKey(root, ChordNames.majAugChord, layerIdx - 1),
                getKey(root + 1, ChordNames.minMajChord, layerIdx),
            ];
        }

        const chordFuncs = {
            [ChordNames.maj7Chord]: maj7Chord,
            [ChordNames.min7Chord]: min7Chord,
            [ChordNames.domChord]: domChord,
            [ChordNames.min7b5Chord]: min7b5Chord,
            [ChordNames.minMajChord]: minMajChord,
            [ChordNames.majAugChord]: majAugChord,
            [ChordNames.domAugChord]: domAugChord,
            [ChordNames.domb5Chord]: domb5Chord,
            [ChordNames.dim7Chord]: dim7Chord,
            [ChordNames.augChord]: augChord,
        };

        function generateConnections(
            rootIdx: number,
            chordName: keyof typeof chordFuncs,
        ): [string, string][] {
            const chordFunc = chordFuncs[chordName];
            return chordFunc(rootIdx).map((connectedChordKey: string) => {
                const connection: [string, string] = [
                    getKey(rootIdx, chordName),
                    connectedChordKey,
                ];
                connection.sort();
                return connection;
            });
        }

        // the graph twists when repeated vertically,
        // so a,b,c,d are modular depending on layerIdx
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
            ...generateConnections(dimRoots[0], ChordNames.dim7Chord),
            ...generateConnections(dimRoots[1], ChordNames.dim7Chord),
            ...generateConnections(dimRoots[2], ChordNames.dim7Chord),
            ...generateConnections(dimRoots[3], ChordNames.dim7Chord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.domAugChord),
            ...generateConnections(chordNotes[b], ChordNames.domAugChord),
            ...generateConnections(chordNotes[c], ChordNames.domAugChord),
            ...generateConnections(chordNotes[d], ChordNames.domAugChord),
            // ...
            ...generateConnections(domb5Roots[0], ChordNames.domb5Chord),
            ...generateConnections(domb5Roots[1], ChordNames.domb5Chord),
            ...generateConnections(domb5Roots[2], ChordNames.domb5Chord),
            ...generateConnections(domb5Roots[3], ChordNames.domb5Chord),
            // ...
            ...generateConnections(augRoots[a], ChordNames.augChord),
            ...generateConnections(augRoots[b], ChordNames.augChord),
            ...generateConnections(augRoots[c], ChordNames.augChord),
            ...generateConnections(augRoots[d], ChordNames.augChord),
        ];

        return [
            {
                // Bottom Layer (height + 0)
                [getKey(chordNotes[a], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.min7b5Chord,
                    [1, 0, 2],
                ),
                [getKey(chordNotes[b], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.min7b5Chord,
                    [2, 0, 1],
                ),
                [getKey(chordNotes[c], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.min7b5Chord,
                    [3, 0, 2],
                ),
                [getKey(chordNotes[d], ChordNames.min7b5Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.min7b5Chord,
                    [2, 0, 3],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.min7Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.min7Chord,
                    [1, 1, 1],
                ),
                [getKey(chordNotes[b], ChordNames.min7Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.min7Chord,
                    [3, 1, 1],
                ),
                [getKey(chordNotes[c], ChordNames.min7Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.min7Chord,
                    [3, 1, 3],
                ),
                [getKey(chordNotes[d], ChordNames.min7Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.min7Chord,
                    [1, 1, 3],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.minMajChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.minMajChord,
                    [0, 2, 1],
                ),
                [getKey(chordNotes[b], ChordNames.minMajChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.minMajChord,
                    [3, 2, 0],
                ),
                [getKey(chordNotes[c], ChordNames.minMajChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.minMajChord,
                    [4, 2, 3],
                ),
                [getKey(chordNotes[d], ChordNames.minMajChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.minMajChord,
                    [1, 2, 4],
                ),
                //...
                [getKey(chordNotes[a], ChordNames.domChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.domChord,
                    [2, 2, 1],
                ),
                [getKey(chordNotes[b], ChordNames.domChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.domChord,
                    [3, 2, 2],
                ),
                [getKey(chordNotes[c], ChordNames.domChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.domChord,
                    [2, 2, 3],
                ),
                [getKey(chordNotes[d], ChordNames.domChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.domChord,
                    [1, 2, 2],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.maj7Chord,
                    [1, 3, 1],
                ),
                [getKey(chordNotes[b], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.maj7Chord,
                    [3, 3, 1],
                ),
                [getKey(chordNotes[c], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.maj7Chord,
                    [3, 3, 3],
                ),
                [getKey(chordNotes[d], ChordNames.maj7Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.maj7Chord,
                    [1, 3, 3],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.majAugChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.majAugChord,
                    [1, 4, 0],
                ),
                [getKey(chordNotes[b], ChordNames.majAugChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.majAugChord,
                    [4, 4, 1],
                ),
                [getKey(chordNotes[c], ChordNames.majAugChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.majAugChord,
                    [3, 4, 4],
                ),
                [getKey(chordNotes[d], ChordNames.majAugChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.majAugChord,
                    [0, 4, 3],
                ),
                // ...
                [getKey(dimRoots[0], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[0],
                    ChordNames.dim7Chord,
                    [2, 3, 2],
                ),
                [getKey(dimRoots[1], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[1],
                    ChordNames.dim7Chord,
                    [2, 3, 2],
                ),
                [getKey(dimRoots[2], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[2],
                    ChordNames.dim7Chord,
                    [2, 3, 2],
                ),
                [getKey(dimRoots[3], ChordNames.dim7Chord)]: getVertex(
                    dimRoots[3],
                    ChordNames.dim7Chord,
                    [2, 3, 2],
                ),
                // ...
                [getKey(chordNotes[a], ChordNames.domAugChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.domAugChord,
                    [2, 3, 0],
                ),
                [getKey(chordNotes[b], ChordNames.domAugChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.domAugChord,
                    [4, 3, 2],
                ),
                [getKey(chordNotes[c], ChordNames.domAugChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.domAugChord,
                    [2, 3, 4],
                ),
                [getKey(chordNotes[d], ChordNames.domAugChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.domAugChord,
                    [0, 3, 2],
                ),
                // ...
                [getKey(domb5Roots[0], ChordNames.domb5Chord)]: getVertex(
                    domb5Roots[0],
                    ChordNames.domb5Chord,
                    [2, 1, 2],
                ),
                [getKey(domb5Roots[1], ChordNames.domb5Chord)]: getVertex(
                    domb5Roots[1],
                    ChordNames.domb5Chord,
                    [2, 1, 2],
                ),
                [getKey(domb5Roots[2], ChordNames.domb5Chord)]: getVertex(
                    domb5Roots[2],
                    ChordNames.domb5Chord,
                    [2, 1, 2],
                ),
                [getKey(domb5Roots[3], ChordNames.domb5Chord)]: getVertex(
                    domb5Roots[3],
                    ChordNames.domb5Chord,
                    [2, 1, 2],
                ),
                // ...
                [getKey(augRoots[a], ChordNames.augChord)]: getVertex(
                    augRoots[a],
                    ChordNames.augChord,
                    [0, 1, 0],
                ),
                [getKey(augRoots[b], ChordNames.augChord)]: getVertex(
                    augRoots[b],
                    ChordNames.augChord,
                    [4, 1, 0],
                ),
                [getKey(augRoots[c], ChordNames.augChord)]: getVertex(
                    augRoots[c],
                    ChordNames.augChord,
                    [4, 1, 4],
                ),
                [getKey(augRoots[d], ChordNames.augChord)]: getVertex(
                    augRoots[d],
                    ChordNames.augChord,
                    [0, 1, 4],
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
            NoteNames.C, // root offset for each diminished group (only need C, C# D
            i * 12 + 0, // height on y-axis (0, 4, 8...)
            i * 3 + 0, // layer number (0, 1, 2...)
        );
        const [secondVertexLayer, secondConnections] = generateVertexLayer(
            NoteNames.Db,
            i * 12 + 4,
            i * 3 + 1,
        );
        const [thirdVertexLayer, thirdConnections] = generateVertexLayer(
            NoteNames.D,
            i * 12 + 8,
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
