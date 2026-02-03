import { ChordNames, NoteNames, PositionType, VertexType } from "../../types";
import { NOTE_NAMES, SHAPES } from "../consts";
import { mod } from "../helpers";

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

        function domSusChord(rootIdx: number) {
            const [root, third, fifth] = SHAPES[ChordNames.domSusChord].map(
                (peg) => mod(peg + rootIdx, 12),
            );
            return [
                getKey(fifth, ChordNames.min7b5Chord, layerIdx),
                getKey(root, ChordNames.domChord, layerIdx),
                getKey(fifth, ChordNames.majb5Chord, layerIdx),
                getKey(root, ChordNames.majSusChord, layerIdx),
            ];
        }

        function majSusChord(rootIdx: number) {
            const [root, third, fifth] = SHAPES[ChordNames.majSusChord].map(
                (peg) => mod(peg + rootIdx, 12),
            );
            return [
                getKey(root + 1, ChordNames.domb5Chord, layerIdx),
                getKey(root, ChordNames.maj7Chord, layerIdx),
                getKey(root, ChordNames.domSusChord, layerIdx),
            ];
        }

        function majb5Chord(rootIdx: number) {
            const [root, third, fifth] = SHAPES[ChordNames.majb5Chord].map(
                (peg) => mod(peg + rootIdx, 12),
            );
            return [
                getKey(fifth, ChordNames.domSusChord, layerIdx),
                getKey(root, ChordNames.maj7Chord, layerIdx),
                getKey(root, ChordNames.domb5Chord, layerIdx),
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
            // what am i doing
            [ChordNames.domSusChord]: domSusChord,
            [ChordNames.majSusChord]: majSusChord,
            [ChordNames.majb5Chord]: majb5Chord,
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
            // ...
            ...generateConnections(chordNotes[a], ChordNames.domSusChord),
            ...generateConnections(chordNotes[b], ChordNames.domSusChord),
            ...generateConnections(chordNotes[c], ChordNames.domSusChord),
            ...generateConnections(chordNotes[d], ChordNames.domSusChord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.majSusChord),
            ...generateConnections(chordNotes[b], ChordNames.majSusChord),
            ...generateConnections(chordNotes[c], ChordNames.majSusChord),
            ...generateConnections(chordNotes[d], ChordNames.majSusChord),
            // ...
            ...generateConnections(chordNotes[a], ChordNames.majb5Chord),
            ...generateConnections(chordNotes[b], ChordNames.majb5Chord),
            ...generateConnections(chordNotes[c], ChordNames.majb5Chord),
            ...generateConnections(chordNotes[d], ChordNames.majb5Chord),
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
                // what am i doing
                [getKey(chordNotes[a], ChordNames.majb5Chord)]: getVertex(
                    chordNotes[a],
                    ChordNames.majb5Chord,
                    [1, 2, 2],
                ),
                [getKey(chordNotes[b], ChordNames.majb5Chord)]: getVertex(
                    chordNotes[b],
                    ChordNames.majb5Chord,
                    [2, 2, 1],
                ),
                [getKey(chordNotes[c], ChordNames.majb5Chord)]: getVertex(
                    chordNotes[c],
                    ChordNames.majb5Chord,
                    [3, 2, 2],
                ),
                [getKey(chordNotes[d], ChordNames.majb5Chord)]: getVertex(
                    chordNotes[d],
                    ChordNames.majb5Chord,
                    [2, 2, 3],
                ),
                // what am i doing
                [getKey(chordNotes[a], ChordNames.majSusChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.majSusChord,
                    [2, 4, 1],
                ),
                [getKey(chordNotes[b], ChordNames.majSusChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.majSusChord,
                    [3, 4, 2],
                ),
                [getKey(chordNotes[c], ChordNames.majSusChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.majSusChord,
                    [2, 4, 3],
                ),
                [getKey(chordNotes[d], ChordNames.majSusChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.majSusChord,
                    [1, 4, 2],
                ),
                // what am i doing
                [getKey(chordNotes[a], ChordNames.domSusChord)]: getVertex(
                    chordNotes[a],
                    ChordNames.domSusChord,
                    [3, 3, 1],
                ),
                [getKey(chordNotes[b], ChordNames.domSusChord)]: getVertex(
                    chordNotes[b],
                    ChordNames.domSusChord,
                    [3, 3, 3],
                ),
                [getKey(chordNotes[c], ChordNames.domSusChord)]: getVertex(
                    chordNotes[c],
                    ChordNames.domSusChord,
                    [1, 3, 3],
                ),
                [getKey(chordNotes[d], ChordNames.domSusChord)]: getVertex(
                    chordNotes[d],
                    ChordNames.domSusChord,
                    [1, 3, 1],
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
