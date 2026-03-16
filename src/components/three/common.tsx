import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text3D, Center, FontData } from "@react-three/drei";
import fontJsonUrl from "../../assets/json/font.json";
import { useDerivedState } from "../../store/hooks";
import { AppStore } from "../../store/state";
import { SceneKey } from "../../store/types";
import {
    ChordNames,
    Orderings,
    ReactMouseEvent,
    RootReferences,
    VertexType,
} from "../../types";
import {
    EMPTY,
    NOTE_NAMES,
    SHAPES,
    COLORS,
    darkGrey,
    grey,
    lightGrey,
    mediumGrey,
    getNotesFromName,
    getPegs,
    soundNotes,
    getScaledPolygonPoints,
    mod,
} from "../../util";

const fontData = fontJsonUrl as unknown as FontData;

interface SceneProps {
    appStore: AppStore;
    scene: SceneKey;
}

export const Controls: React.FC = () => {
    const orbitRef = useRef<OrbitControlsImpl>(null);

    useFrame(() => {
        orbitRef.current && orbitRef.current.update();
    });

    return <OrbitControls rotateSpeed={3} panSpeed={1} ref={orbitRef} />;
};

export const Lights: React.FC = () => {
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (lightRef.current) {
            lightRef.current.position.copy(state.camera.position);
        }
    });

    return (
        <>
            <pointLight
                ref={lightRef}
                intensity={6}
                distance={100000}
                decay={0}
            />
            <ambientLight intensity={1} />
        </>
    );
};

interface ScaleBallProps extends SceneProps {
    vertices: VertexType[];
    radius: number;
}

// main sphere of scale vertex
export const ScaleBall: React.FC<ScaleBallProps> = ({
    appStore,
    vertices,
    radius,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.SphereGeometry>(null);
    const materialRef = useRef<THREE.MeshPhongMaterial>(null);
    const firstColorRef = useRef(grey);
    const secondColorRef = useRef(grey);

    useEffect(() => {
        setGeometryColor(firstColorRef.current, secondColorRef.current);

        return appStore.addListener((appState) => {
            const { selected } = appState;

            const colorOptions: string[] = [];
            for (let vertex of vertices) {
                const vertexNotes = getNotesFromName(
                    vertex.root,
                    vertex.scaleType,
                );
                for (let i = 0; i < selected.length; i++) {
                    const selectedPegs = getPegs(selected[i]);
                    const isMatch =
                        selectedPegs.length &&
                        selectedPegs.every((i) => vertexNotes[i]);
                    if (isMatch) {
                        const color = COLORS(1)[i];
                        // colorOptions.push(color);  // uncomment to experiment with scale ball color
                    }
                }
            }

            const firstColor = colorOptions[0] || grey;
            const secondColor = colorOptions[1] || firstColor;

            if (
                firstColorRef.current !== firstColor ||
                secondColorRef.current !== secondColor
            ) {
                firstColorRef.current = firstColor;
                secondColorRef.current = secondColor;
                setGeometryColor(firstColor, secondColor);
            }
        });
    }, []);

    function setGeometryColor(firstColor: string, secondColor: string) {
        const geom = geometryRef.current;
        if (!geom) return;

        const colors = [];

        const color1 = new THREE.Color(firstColor);
        const color2 = new THREE.Color(secondColor);

        // const segmentColors = [color1, color2, color1, color2];
        const segmentColors = [color2, color1, color2, color1];

        // Apply colors with 180 degree twist (spiral effect)
        const positions = geom.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            // Base angle around Y axis
            let angle = Math.atan2(z, x);
            if (angle < 0) angle += Math.PI * 2;

            // Add twist based on Y position (height on sphere)
            // Normalize y to range -1 to 1, then map to 0 to π for half twist
            const normalizedY = y / radius; // sphere radius is 2
            const twist = normalizedY * Math.PI * 0.385; // Half rotation (180 degrees)

            // Combine base angle with twist
            let twistedAngle = angle + twist;

            // Normalize to 0 to 2π range
            while (twistedAngle < 0) twistedAngle += Math.PI * 2;
            while (twistedAngle >= Math.PI * 2) twistedAngle -= Math.PI * 2;

            const segmentIndex =
                Math.floor((twistedAngle / (Math.PI * 2)) * 4) % 4;
            const color = segmentColors[segmentIndex];

            colors.push(color.r, color.g, color.b);
        }

        geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    // build default outer sphere
    return (
        <mesh castShadow ref={meshRef}>
            <sphereGeometry ref={geometryRef} args={[radius, 256, 256]} />
            <meshPhongMaterial
                ref={materialRef}
                vertexColors
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

interface ScalePolygonProps extends SceneProps {
    inputIndex: number;
    vertex: VertexType;
    radius: number;
}

const ScalePolygon: React.FC<ScalePolygonProps> = ({
    appStore,
    inputIndex,
    vertex,
    radius,
}) => {
    const color = COLORS(1)[inputIndex];
    const selectedNotesRef = useRef(appStore.state.selected[inputIndex]);
    const orderingRef = useRef(appStore.state.ordering);

    const [getState] = useDerivedState(
        appStore,
        (
            { selected, normalizedPolygonPoints, ordering },
            componentState: { shape: THREE.Shape | null },
        ) => {
            const selectedNotes = selected[inputIndex];

            // if dependencies haven't changed, don't recalculate
            if (
                selectedNotesRef.current.every(
                    (note, i) => note === selectedNotes[i],
                ) &&
                orderingRef.current === ordering
            ) {
                return componentState || { shape: null };
            }

            // set refs
            selectedNotesRef.current = selectedNotes;
            orderingRef.current = ordering;

            const { root, scaleType } = vertex;
            const vertexNotes = getNotesFromName(root, scaleType);

            // only draw polygon if this specific inputIndex matches this vertex
            if (
                selectedNotes.every(
                    (note, i) => !note || (note && vertexNotes[i]),
                )
            ) {
                const points = getScaledPolygonPoints(
                    normalizedPolygonPoints[inputIndex],
                    "three",
                    16,
                    0,
                ).map(([x, y]) => new THREE.Vector2(x, y));

                return {
                    shape: points.length ? new THREE.Shape(points) : null,
                };
            }
            return { shape: null };
        },
    );
    const { shape } = getState();

    if (!shape) return null;

    return (
        <mesh position={[0, 0, radius + 0.01 * inputIndex]}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

interface ScaleTextProps {
    vertices: VertexType[];
}

// text on scale ball
export const ScaleText: React.FC<ScaleTextProps> = ({ vertices }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const { position } = vertices[0];
    // flip to true if you want to see positions of nodes along with the name
    const debug = false;

    function getLabel(vertices: VertexType[]) {
        // symmetric labels are custom.
        if (vertices.length > 1) {
            const roots = vertices.map((vertex) => vertex.root).join(",");
            return `${roots}\n${vertices[0].scaleType}`;
        }

        // For the normal cases, build label out of root and scaleType.
        let label = `${vertices[0].root} ${vertices[0].scaleType}`;

        // Line break for long names.
        if (label.length > 7) {
            label = label.replace(" ", "\n");
        }

        // Long scale names get abbreviated.
        if (
            [
                ChordNames.melMinScale,
                ChordNames.harMajScale,
                ChordNames.harMinScale,
            ].includes(vertices[0].scaleType)
        ) {
            label = label.slice(0, -2);
        }

        return label;
    }

    useEffect(() => {
        // things that should happen on first render cylce after mounting
        if (meshRef.current) {
            // move scale name along the z axis of sphere to its edge
            const t = new THREE.Vector3(0, 0, 1);
            meshRef.current.translateOnAxis(t, 19.5);
        }
    }, []);

    return (
        <Center>
            <Text3D ref={meshRef} height={2} size={4} font={fontData}>
                {getLabel(vertices)}
                {debug &&
                    `\nx: ${position[0] / 150}, y: ${position[1] / 150}, z: ${position[2] / 150}`}
                <meshPhysicalMaterial ref={materialRef} color={darkGrey} />
            </Text3D>
        </Center>
    );
};

interface NoteBallProps extends SceneProps {
    noteIndex: number;
    vertices: VertexType[];
    radius: number;
}

// little notes for each scale
export const NoteBall: React.FC<NoteBallProps> = ({
    appStore,
    noteIndex,
    vertices,
    radius,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.SphereGeometry>(null);
    const materialRef = useRef<THREE.MeshPhongMaterial>(null);

    useEffect(() => {
        // things that should happen on first render cylce after mounting
        const { selected, ordering } = appStore.state;
        setMaterialColor(selected, ordering);

        // create directional vectors from center of outer sphere to build note clock
        let x = Math.sin((2 * noteIndex * Math.PI) / 12);
        let y = Math.cos((2 * noteIndex * Math.PI) / 12);

        // these make a 12-pointed cone shape around the z axis of the outer sphere
        const v = new THREE.Vector3(x, y, 1);
        v.normalize();
        if (meshRef.current) {
            meshRef.current.translateOnAxis(v, radius);
        }

        return appStore.addListener((appState) => {
            const { selected, ordering } = appState;
            setMaterialColor(selected, ordering);
        });
    }, []);

    function setMaterialColor(selected: boolean[][], ordering: Orderings) {
        if (materialRef.current) {
            let isSelected = false;
            let highlightColor = null;

            // get relative index considering order of fifths or chromatic
            const index =
                ordering === Orderings.fifths
                    ? mod(7 * noteIndex, 12)
                    : noteIndex;

            // iterate over all vertices that this node represents
            for (let vertex of vertices) {
                const vertexNotes = getNotesFromName(
                    vertex.root,
                    vertex.scaleType,
                );
                // check to see if this specific note should be selected (darker grey)
                if (vertexNotes[index]) isSelected = true;
                // check to see if this specific note should be highlighted (color)
                for (let i = 0; i < selected.length; i++) {
                    let selectedPegs = getPegs(selected[i]);

                    const isMatch =
                        selectedPegs.length &&
                        selectedPegs.every((peg) => vertexNotes[peg]);

                    // the highlightColor should always be the color of the
                    // first input index that matches this vertex's notes.
                    if (isMatch && selected[i][index] && !highlightColor) {
                        highlightColor = COLORS(1)[i];
                        break;
                    }
                }
            }

            if (highlightColor) {
                materialRef.current.color.set(highlightColor);
            } else if (isSelected) {
                materialRef.current.color.set(mediumGrey);
            } else {
                materialRef.current.color.set(lightGrey);
            }
        }
    }

    return (
        <mesh castShadow ref={meshRef}>
            <sphereGeometry ref={geometryRef} args={[4, 32, 16]} />
            <meshPhongMaterial
                ref={materialRef}
                color={lightGrey}
                reflectivity={1}
            />
        </mesh>
    );
};

interface NoteTextProps extends SceneProps {
    noteIndex: number;
}

// text on note ball
export const NoteText: React.FC<NoteTextProps> = ({
    appStore,
    scene,
    noteIndex,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    const rootReferenceRef = useRef(appStore.state.rootReference);
    const orderingRef = useRef(appStore.state.ordering);

    const fifthIndex = mod(noteIndex * 7, 12);

    const refLabel = {
        numbers: noteIndex,
        names: NOTE_NAMES[noteIndex],
        // degrees: numLabel,
        degrees: NOTE_NAMES[noteIndex],

        numbersFifths: fifthIndex,
        namesFifths: NOTE_NAMES[fifthIndex],
        // degrees: numLabel,
        degreesFifths: NOTE_NAMES[fifthIndex],
    };

    const [visibleLabel, setVisibleLabel] = useState<string>(refLabel.names);

    useEffect(() => {
        // create directional vectors from center of outer sphere to build note clock
        let x = Math.sin((2 * noteIndex * Math.PI) / 12);
        let y = Math.cos((2 * noteIndex * Math.PI) / 12);

        // this one is slightly narrower and further out for the text to rest on the note balls
        const z = new THREE.Vector3(x, y, 1.25);
        z.normalize();
        if (meshRef.current) {
            meshRef.current.translateOnAxis(z, 23);
        }

        return appStore.addListener(({ rootReference, ordering }) => {
            if (
                rootReference !== rootReferenceRef.current ||
                orderingRef.current !== ordering
            ) {
                rootReferenceRef.current = rootReference;
                orderingRef.current = ordering;

                if (
                    rootReference === RootReferences.names &&
                    ordering === Orderings.chromatic
                ) {
                    setVisibleLabel(refLabel.names);
                } else if (
                    rootReference === RootReferences.names &&
                    ordering === Orderings.fifths
                ) {
                    setVisibleLabel(refLabel.namesFifths);
                } else if (
                    rootReference === RootReferences.numbers &&
                    ordering === Orderings.chromatic
                ) {
                    setVisibleLabel(`${refLabel.numbers}`);
                } else if (
                    rootReference === RootReferences.numbers &&
                    ordering === Orderings.fifths
                ) {
                    setVisibleLabel(`${refLabel.numbersFifths}`);
                } else if (
                    rootReference === RootReferences.degrees &&
                    ordering === Orderings.chromatic
                ) {
                    setVisibleLabel(refLabel.degrees);
                } else if (
                    rootReference === RootReferences.degrees &&
                    ordering === Orderings.fifths
                ) {
                    setVisibleLabel(refLabel.degreesFifths);
                }
            }
        });
    }, []);

    return (
        <Center>
            <Text3D ref={meshRef} font={fontData} height={1} size={2}>
                {visibleLabel}
                <meshPhysicalMaterial ref={materialRef} color={darkGrey} />
            </Text3D>
        </Center>
    );
};

interface ScaleVertexProps extends SceneProps {
    vertices: VertexType[];
}

// a sphere with text and little noteballs on it
export const ScaleVertex: React.FC<ScaleVertexProps> = ({
    appStore,
    scene,
    vertices,
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const innerGroupRef = useRef<THREE.Group>(null);
    const isVisibleRef = useRef(getScaleVertexVisible(vertices));
    const isMuteRef = useRef(appStore.state.mute);
    // const notes = getScaleVertexNotes(vertices);
    const vertexKeys = vertices.map(({ key }) => key);
    const position = vertices[0].position; // all vertices shared by a ScaleVertex are in same position
    const radius = 20;

    useEffect(
        () =>
            appStore.addListener((appState) => {
                const { mute } = appState;
                const { vertices: allVertices } = appState[scene];
                const vertices = vertexKeys.map((key) => allVertices[key]);
                isVisibleRef.current = getScaleVertexVisible(vertices);
                isMuteRef.current = mute;
            }),
        [],
    );

    useFrame((state) => {
        // things that should happen on every render

        if (innerGroupRef.current) {
            innerGroupRef.current.lookAt(state.camera.position);
        }

        if (groupRef.current) {
            // keep group always facing camera (z axis)
            // groupRef.current.lookAt(state.camera.position);
            // hide scale ball when store updates ref
            groupRef.current.visible = isVisibleRef.current;
        }
    });

    // Get union of notes from each vertex to display on noteballs
    function getScaleVertexNotes(vertices: VertexType[]) {
        let commonNotes = [...EMPTY];
        vertices.forEach(({ root, scaleType }) => {
            const notes = getNotesFromName(root, scaleType);
            notes.forEach((note, i) => {
                if (note) commonNotes[i] = true;
            });
        });
        return commonNotes;
    }

    // if any vertex is visible, this whole ScaleVertex is visible
    function getScaleVertexVisible(vertices: VertexType[]) {
        return vertices.some((vertex) => !vertex.hidden);
    }

    // TODO: Fix me, only plays first vertex in list for now
    const onClick = (e: ReactMouseEvent) => {
        e.stopPropagation();
        if (isMuteRef.current) return;

        const { root, rootIdx, scaleType } = vertices[0];
        const notes = getNotesFromName(root, scaleType);
        if (!notes) return;

        if (scene === SceneKey.chordCube) {
            // make a spread voicing and "strum" the chord
            const shape = SHAPES[scaleType];
            let pegs = shape;
            let octave = 5;
            if (shape.length == 4) {
                pegs = [shape[0], shape[3], shape[1], shape[2]].map(
                    (peg) => peg + rootIdx,
                );
                octave = rootIdx >= 6 ? 3 : 4;
            }

            soundNotes(pegs, 0, true, octave);
        } else if (scene === SceneKey.keyCube) {
            // arpeggiate the scale
            const chord = getPegs(notes);
            const modeIdx = chord.indexOf(rootIdx);
            soundNotes(chord, modeIdx, false);
        }
    };

    // build default outer sphere
    let ballKey = `scale-ball-${vertexKeys[0]}`;
    const scaleBall = (
        <ScaleBall
            key={ballKey}
            appStore={appStore}
            scene={scene}
            vertices={vertices}
            radius={radius}
        />
    );

    // text for outer sphere
    let textKey = `scale-text-${vertexKeys[0]}`;
    const scaleText = <ScaleText key={textKey} vertices={vertices} />;

    // build default noteballs and text
    const noteBalls: React.JSX.Element[] = [];
    const noteTexts: React.JSX.Element[] = [];
    for (let i = 0; i < 12; i++) {
        ballKey = `note-ball-${vertexKeys[0]}-${i}`;
        textKey = `note-text-${vertexKeys[0]}-${i}`;
        noteBalls.push(
            <NoteBall
                key={ballKey}
                appStore={appStore}
                scene={scene}
                vertices={vertices}
                noteIndex={i}
                radius={radius}
            />,
        );

        // TODO, feed info here that helps determine numLabel and ordering
        noteTexts.push(
            <NoteText
                key={textKey}
                appStore={appStore}
                scene={scene}
                noteIndex={i}
            />,
        );
    }

    // chord polygons
    const scalePolygons: React.JSX.Element[] = [];
    const alreadySeen = new Set();
    for (let i = 0; i < appStore.state.selected.length; i++) {
        vertices.forEach((vertex, j) => {
            const { key, root, scaleType, layerIdx } = vertex;
            const vertexPegs = getPegs(getNotesFromName(root, scaleType));
            const uniqueKey = [...vertexPegs, i, layerIdx].join(",");

            if (!alreadySeen.has(uniqueKey)) {
                let polygonKey = `scale-polygon-${key}-${i}`;
                scalePolygons.push(
                    <ScalePolygon
                        key={polygonKey}
                        appStore={appStore}
                        scene={scene}
                        inputIndex={i}
                        vertex={vertex}
                        radius={radius}
                    />,
                );
                alreadySeen.add(uniqueKey);
            }
        });
    }

    return (
        <>
            <group ref={groupRef} position={position} onClick={onClick}>
                {scaleBall}
                <group ref={innerGroupRef}>
                    {scaleText}
                    {noteBalls}
                    {noteTexts}
                    {scalePolygons}
                </group>
            </group>
        </>
    );
};

// Create Scale Vertices for every scale
export const ScaleVertices: React.FC<SceneProps> = ({ appStore, scene }) => {
    const { vertices: allVertices } = appStore.state[scene];
    const alreadySeen = new Set();

    return (
        <>
            {Object.entries(allVertices).map(([key, vertex]) => {
                // for enharmonic vertices, we only want to render a single ScaleVertex
                if (alreadySeen.has(key)) return null;
                alreadySeen.add(vertex.key);
                const vertices = [vertex];

                const { alternativeKeys } = vertex;
                alternativeKeys.forEach((alternativeKey) => {
                    alreadySeen.add(alternativeKey);
                    vertices.push(allVertices[alternativeKey]);
                });

                return (
                    <ScaleVertex
                        key={key}
                        appStore={appStore}
                        scene={scene}
                        vertices={vertices}
                    />
                );
            })}
        </>
    );
};

interface EdgeProps extends SceneProps {
    startVertices: VertexType[];
    endVertices: VertexType[];
}

// An edge from start node => end node
export const Edge: React.FC<EdgeProps> = ({
    appStore,
    scene,
    startVertices,
    endVertices,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.CylinderGeometry>(null);
    const materialRef = useRef<THREE.MeshPhongMaterial>(null);
    const [a1, a2, a3] = startVertices[0].position;
    const [b1, b2, b3] = endVertices[0].position;
    const size = Math.sqrt((a1 - b1) ** 2 + (a2 - b2) ** 2 + (a3 - b3) ** 2);

    useEffect(() => {
        // things that should happen on first render cylce after mounting
        setEdgeColor(startVertices, endVertices);
        setIsVisible(startVertices, endVertices);

        // get corners from edgePair and orient the mesh/geometry of each edge to look from start => end
        let start = new THREE.Vector3(...startVertices[0].position);
        let end = new THREE.Vector3(...endVertices[0].position);

        if (meshRef.current) {
            // position and orient the axes for the geometry, start => end
            meshRef.current.position.copy(start);
            meshRef.current.lookAt(end);
        }

        if (geometryRef.current) {
            // edge starts as vertical pipe skewered through sphere at its center
            // we need to translate it upwards, and rotate it by 90 degrees towards x
            geometryRef.current.translate(0, size / 2, 0);
            geometryRef.current.rotateX(Math.PI / 2);
        }

        return appStore.addListener((appState) => {
            const { vertices } = appState[scene];

            const newStartVertices = startVertices.map(
                (vertex) => vertices[vertex.key],
            );
            const newEndVertices = endVertices.map(
                (vertex) => vertices[vertex.key],
            );

            setEdgeColor(newStartVertices, newEndVertices);
            setIsVisible(newStartVertices, newEndVertices);
        });
    }, []);

    function setEdgeColor(
        startVertices: VertexType[],
        endVertices: VertexType[],
    ) {
        // loop over startVertices, endVertices, and inputs to see if the input chord
        // is found in both the startVertex and endVertex. Then color the edge accordingly.
        if (materialRef.current) {
            const { selected } = appStore.state;
            const matchingInputColors = [];
            for (let startVertex of startVertices) {
                const startVertexNotes = getNotesFromName(
                    startVertex.root,
                    startVertex.scaleType,
                );
                for (let endVertex of endVertices) {
                    const endVertexNotes = getNotesFromName(
                        endVertex.root,
                        endVertex.scaleType,
                    );
                    for (let i = 0; i < selected.length; i++) {
                        const selectedPegs = getPegs(selected[i]);
                        if (!selectedPegs.length) continue;
                        const startMatches = selectedPegs.every(
                            (i) => startVertexNotes[i],
                        );
                        const endMatches = selectedPegs.every(
                            (i) => endVertexNotes[i],
                        );
                        if (startMatches && endMatches) {
                            const color = COLORS(1)[i];
                            matchingInputColors.push(color);
                        }
                    }
                }
            }

            materialRef.current.color.set(matchingInputColors[0] || mediumGrey);
        }
    }

    function setIsVisible(
        startVertices: VertexType[],
        endVertices: VertexType[],
    ) {
        // hide edge if either vertex is hidden
        if (meshRef.current) {
            const isStartVisible = startVertices.some(
                (vertex) => !vertex.hidden,
            );
            const isEndVisible = endVertices.some((vertex) => !vertex.hidden);
            meshRef.current.visible = isStartVisible && isEndVisible;
        }
    }

    return (
        <mesh position={startVertices[0].position} ref={meshRef} castShadow>
            <cylinderGeometry ref={geometryRef} args={[3, 3, size, 16]} />
            <meshPhongMaterial ref={materialRef} color={mediumGrey} />
        </mesh>
    );
};

// create EdgeCubes for every cube of vertices/edges
export const Edges: React.FC<SceneProps> = ({ appStore, scene }) => {
    const edges: React.JSX.Element[] = [];
    const { connections, vertices } = appStore.state[scene];

    // loop over edgePairs, created default edge for each pair
    for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        if (
            vertices[connection[0]] === undefined ||
            vertices[connection[1]] === undefined
        ) {
            continue;
        }

        const startVertex = vertices[connection[0]];
        const startVertices = [startVertex];
        const endVertex = vertices[connection[1]];
        const endVertices = [endVertex];
        const startVertexNotes = getNotesFromName(
            startVertex.root,
            startVertex.scaleType,
        );
        const endVertexNotes = getNotesFromName(
            endVertex.root,
            endVertex.scaleType,
        );

        for (let key of startVertex.alternativeKeys) {
            const altVertex = vertices[key];
            const { root, scaleType } = altVertex;
            const altVertexNotes = getNotesFromName(root, scaleType);
            if (compareNotes(startVertexNotes, altVertexNotes)) {
                startVertices.push(altVertex);
            }
        }

        for (let key of endVertex.alternativeKeys) {
            const altVertex = vertices[key];
            const { root, scaleType } = altVertex;
            const altVertexNotes = getNotesFromName(root, scaleType);
            if (compareNotes(endVertexNotes, altVertexNotes)) {
                endVertices.push(altVertex);
            }
        }

        function compareNotes(firstNotes: boolean[], secondNotes: boolean[]) {
            return firstNotes.every((note, i) => note === secondNotes[i]);
        }

        const edge = (
            <Edge
                key={`edge-group-${connection}`}
                appStore={appStore}
                scene={scene}
                startVertices={startVertices}
                endVertices={endVertices}
            />
        );

        edges.push(edge);
    }

    return <>{edges}</>;
};
