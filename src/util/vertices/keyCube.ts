import { ChordNames, PositionType, VertexType } from "../../types";
import { NOTE_NAMES, SHAPES } from "../consts";
import { mod } from "../helpers";

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
