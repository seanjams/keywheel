import React, { useRef, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text3D, Center } from "@react-three/drei";
import {
    CUBE_POSITIONS,
    CUBE_SIZE,
    STARTING_POS,
    NOTE_NAMES,
    VERTICES,
    majorScale,
    harMinScale,
    melMinScale,
    harMajScale,
} from "../consts";
import { darkGrey, grey, lightGrey, mediumGrey, red, yellow } from "../colors";
import { AppStore } from "../store/state";
import { ChordNames, NoteNames, PositionType } from "../types";
import { DEFAULT_NOTE_COLOR_OPTIONS, getNotesFromName, mod } from "../util";

interface KeyCubeProps {
    appStore: AppStore;
}

// TODO: add drag reposition controls
const Controls: React.FC = () => {
    const orbitRef = useRef<OrbitControlsImpl>(null);

    useFrame(() => {
        orbitRef.current && orbitRef.current.update();
    });

    return <OrbitControls rotateSpeed={3} panSpeed={1} ref={orbitRef} />;
};

const Lights = () => {
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

// const context = React.createContext();
// const Outline = ({ children, active }) => {
//     const { gl, scene, camera, size } = useThree();
//     const composer = useRef(null);
//     // const [hovered, set] = useState([]);
//     const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [
//         size,
//     ]);
//     useEffect(() => composer.current.setSize(size.width, size.height), [size]);
//     useFrame(() => composer.current.render(), 1);
//     return (
//         <context.Provider value={set}>
//             {children}
//             <effectComposer ref={composer} args={[gl]}>
//                 <renderPass attachArray="passes" args={[scene, camera]} />
//                 <outlinePass
//                     attachArray="passes"
//                     args={[aspect, scene, camera]}
//                     selectedObjects={active}
//                     visibleEdgeColor="white"
//                     edgeStrength={50}
//                     edgeThickness={1}
//                 />
//                 {/* <shaderPass
//                     attachArray="passes"
//                     args={[FXAAShader]}
//                     uniforms-resolution-value={[
//                         1 / size.width,
//                         1 / size.height,
//                     ]}
//                 /> */}
//             </effectComposer>
//         </context.Provider>
//     );
// };

interface ScaleBallProps extends KeyCubeProps {
    name: string;
}

// main sphere of scale vertex
export const ScaleBall: React.FC<ScaleBallProps> = ({ appStore, name }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.SphereGeometry>(null);
    const materialRef = useRef<THREE.MeshPhongMaterial>(null);

    const optionsRef = useRef(
        appStore.state.threeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS,
    );

    useEffect(() => {
        return appStore.addListener(({ threeProps }) => {
            optionsRef.current = threeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS;
        });
    }, []);

    useFrame((state) => {
        // things that should happen on every render

        // change outer sphere of scale vertex
        if (materialRef.current) {
            const options = optionsRef.current;
            if (options && options.some((option) => option.length > 1)) {
                materialRef.current.color.set(yellow);
            } else {
                materialRef.current.color.set(grey);
            }
        }
    });

    // build default outer sphere
    return (
        <mesh castShadow ref={meshRef}>
            <sphereGeometry ref={geometryRef} args={[20, 32, 16]} />
            <meshPhongMaterial ref={materialRef} color={mediumGrey} />
        </mesh>
    );
};

interface ScaleTextProps extends KeyCubeProps {
    layoutKey: string;
    label: string;
}

// text on scale ball
export const ScaleText: React.FC<ScaleTextProps> = ({
    appStore,
    label,
    layoutKey,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const { layoutDisabledKeys } = appStore.state;
    const layoutDisabledRef = useRef(layoutDisabledKeys[layoutKey] || false);

    useEffect(() => {
        return appStore.addListener(({ layoutDisabledKeys }) => {
            layoutDisabledRef.current = layoutDisabledKeys[layoutKey] || false;
        });
    }, []);

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting
        if (layoutDisabledRef.current) return;

        if (meshRef.current) {
            // move scale name along the z axis of sphere to its edge
            const t = new THREE.Vector3(0, 0, 1);
            meshRef.current.translateOnAxis(t, 19.5);
        }

        layoutDisabledRef.current = true;
        appStore.dispatch.setLayoutDisabledKey(
            layoutKey,
            layoutDisabledRef.current,
        );
    });

    return (
        <Center>
            <Text3D ref={meshRef} height={2} size={4} font="../font.json">
                {label}
                <meshPhysicalMaterial ref={materialRef} color={darkGrey} />
            </Text3D>
        </Center>
    );
};

interface NoteBallProps extends KeyCubeProps {
    name: string;
    layoutKey: string;
    index: number;
}

// little notes for each scale
export const NoteBall: React.FC<NoteBallProps> = ({
    appStore,
    name,
    index,
    layoutKey,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.SphereGeometry>(null);
    const materialRef = useRef<THREE.MeshPhongMaterial>(null);
    const { threeProps, layoutDisabledKeys } = appStore.state;

    const optionsRef = useRef(threeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS);
    const layoutDisabledRef = useRef(layoutDisabledKeys[layoutKey] || false);

    useEffect(() => {
        return appStore.addListener(({ threeProps, layoutDisabledKeys }) => {
            layoutDisabledRef.current = layoutDisabledKeys[layoutKey] || false;
            optionsRef.current = threeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS;
        });
    }, []);

    useFrame((state) => {
        // things that should happen on every render

        // change inner spheres (notes) of scale vertex
        if (materialRef.current) {
            const options = optionsRef.current[index];
            materialRef.current.color.set(options[options.length - 1]);
        }
    });

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting
        if (layoutDisabledRef.current) return;

        // create directional vectors from center of outer sphere to build note clock
        let x = Math.sin((2 * index * Math.PI) / 12);
        let y = Math.cos((2 * index * Math.PI) / 12);

        // these make a 12-pointed cone shape around the z axis of the outer sphere
        const v = new THREE.Vector3(x, y, 1);
        v.normalize();
        if (meshRef.current) {
            meshRef.current.translateOnAxis(v, 20);
        }

        layoutDisabledRef.current = true;
        appStore.dispatch.setLayoutDisabledKey(
            layoutKey,
            layoutDisabledRef.current,
        );
    });

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

interface NoteTextProps extends KeyCubeProps {
    layoutKey: string;
    index: number;
}

// text on note ball
export const NoteText: React.FC<NoteTextProps> = ({
    appStore,
    index,
    layoutKey,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const { layoutDisabledKeys } = appStore.state;
    const layoutDisabledRef = useRef(layoutDisabledKeys[layoutKey] || false);

    useEffect(() => {
        return appStore.addListener(({ layoutDisabledKeys }) => {
            layoutDisabledRef.current = layoutDisabledKeys[layoutKey] || false;
        });
    }, []);

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting
        if (layoutDisabledRef.current) return;

        // create directional vectors from center of outer sphere to build note clock
        let x = Math.sin((2 * index * Math.PI) / 12);
        let y = Math.cos((2 * index * Math.PI) / 12);

        // this one is slightly narrower and further out for the text to rest on the note balls
        const z = new THREE.Vector3(x, y, 1.25);
        z.normalize();
        if (meshRef.current) {
            meshRef.current.translateOnAxis(z, 23);
        }

        layoutDisabledRef.current = true;
        appStore.dispatch.setLayoutDisabledKey(
            layoutKey,
            layoutDisabledRef.current,
        );
    });

    return (
        <Center>
            <Text3D ref={meshRef} font="../font.json" height={1} size={2}>
                {NOTE_NAMES[index]}
                <meshPhysicalMaterial ref={materialRef} color={darkGrey} />
            </Text3D>
        </Center>
    );
};

interface ScaleVertexProps extends KeyCubeProps {
    name: string;
}

// a sphere with text and little noteballs on it
export const ScaleVertex: React.FC<ScaleVertexProps> = ({ appStore, name }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { root, label, position, scaleType } = VERTICES[name];
    const notes = getNotesFromName(root, scaleType);

    useFrame((state) => {
        // things that should happen on every render

        // keep group always facing camera (z axis)
        if (groupRef.current) {
            groupRef.current.lookAt(state.camera.position);
        }
    });

    // build default outer sphere
    let ballKey = `scale-ball-${name}`;
    let textKey = `scale-text-${name}`;
    const scaleBall = (
        <ScaleBall key={ballKey} appStore={appStore} name={name} />
    );
    const scaleText = (
        <ScaleText
            key={textKey}
            appStore={appStore}
            layoutKey={textKey}
            label={label}
        />
    );

    // build default noteballs
    const noteBalls: React.JSX.Element[] = [];
    const noteTexts: React.JSX.Element[] = [];
    for (let i = 0; i < 12; i++) {
        ballKey = `note-ball-${name}-${i}`;
        textKey = `note-text-${name}-${i}`;
        noteBalls.push(
            <NoteBall
                key={ballKey}
                appStore={appStore}
                layoutKey={ballKey}
                name={name}
                index={i}
            />,
        );

        if (notes && notes[i]) {
            noteTexts.push(
                <NoteText
                    key={textKey}
                    appStore={appStore}
                    layoutKey={textKey}
                    index={i}
                />,
            );
        }
    }

    return (
        <group ref={groupRef} position={position}>
            {scaleText}
            {scaleBall}
            {noteBalls}
            {noteTexts}
        </group>
    );
};

// Create Scale Vertices for every scale
export const ScaleVertices: React.FC<KeyCubeProps> = ({ appStore }) => {
    return (
        <>
            {Object.keys(VERTICES).map((key) => (
                <ScaleVertex key={key} appStore={appStore} name={key} />
            ))}
        </>
    );
};

interface EdgeProps extends KeyCubeProps {
    startVertex: {
        root: NoteNames;
        label: ChordNames;
        position: PositionType;
    };
    endVertex: {
        root: NoteNames;
        label: ChordNames;
        position: PositionType;
    };
    layoutKey: string;
}

// An edge from start node => end node
export const Edge: React.FC<EdgeProps> = ({
    appStore,
    startVertex,
    endVertex,
    layoutKey,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.CylinderGeometry>(null);
    const materialRef = useRef<THREE.MeshPhongMaterial>(null);
    const startKey = `${startVertex.root}-${startVertex.label}-0`;
    const endKey = `${endVertex.root}-${endVertex.label}-0`;
    const { threeProps, layoutDisabledKeys } = appStore.state;
    const startOptionsRef = useRef(
        threeProps[startKey] || DEFAULT_NOTE_COLOR_OPTIONS,
    );
    const endOptionsRef = useRef(
        threeProps[endKey] || DEFAULT_NOTE_COLOR_OPTIONS,
    );
    const layoutDisabledRef = useRef(layoutDisabledKeys[layoutKey] || false);

    useEffect(() => {
        return appStore.addListener(({ threeProps, layoutDisabledKeys }) => {
            startOptionsRef.current =
                threeProps[startKey] || DEFAULT_NOTE_COLOR_OPTIONS;
            endOptionsRef.current =
                threeProps[endKey] || DEFAULT_NOTE_COLOR_OPTIONS;
            layoutDisabledRef.current = layoutDisabledKeys[layoutKey] || false;
        });
    }, []);

    useFrame((state) => {
        // things that should happen on every render

        // change outer sphere of scale vertex
        if (materialRef.current) {
            if (
                startOptionsRef.current.some((option) => option.length > 1) &&
                endOptionsRef.current.some((option) => option.length > 1)
            ) {
                materialRef.current.color.set(red);
            } else {
                materialRef.current.color.set(mediumGrey);
            }
        }
    });

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting
        if (layoutDisabledRef.current) return;

        // get corners from edgePair and orient the mesh/geometry of each edge to look from start => end
        let start = new THREE.Vector3(...startVertex.position);
        let end = new THREE.Vector3(...endVertex.position);

        if (meshRef.current) {
            // position and orient the axes for the geometry, start => end
            meshRef.current.position.copy(start);
            meshRef.current.lookAt(end);
        }

        if (geometryRef.current) {
            // edge starts as vertical pipe skewered through sphere at its center
            // we need to translate it upwards, and rotate it by 90 degrees towards x
            geometryRef.current.translate(0, CUBE_SIZE / 2, 0);
            geometryRef.current.rotateX(Math.PI / 2);
        }

        layoutDisabledRef.current = true;
        appStore.dispatch.setLayoutDisabledKey(
            layoutKey,
            layoutDisabledRef.current,
        );
    });

    return (
        <mesh position={startVertex.position} ref={meshRef} castShadow>
            <cylinderGeometry ref={geometryRef} args={[3, 3, CUBE_SIZE, 16]} />
            <meshPhongMaterial ref={materialRef} color={mediumGrey} />
        </mesh>
    );
};

interface EdgeCubeProps extends KeyCubeProps {
    position: PositionType;
    name: string;
    index: number;
}

// Boxes of edges
export const EdgeCube: React.FC<EdgeCubeProps> = ({
    appStore,
    position,
    name,
    index,
}) => {
    const edges: React.JSX.Element[] = [];
    const [root, label] = name.split("\n") as [
        NoteNames,
        "Major" | "Mel min" | "Har Min",
    ];
    const rootIdx = NOTE_NAMES.indexOf(root as NoteNames);

    // pairs of indices of adjustmentBank positions that should have an edge between them
    const edgePairs = [
        [0, 1],
        [0, 2],
        [1, 4],
        [2, 4],
        [0, 3],
        [1, 5],
        [4, 7],
        [2, 6],
        [3, 5],
        [3, 6],
        [5, 7],
        [6, 7],
    ];

    const adjustmentBank: {
        position: PositionType;
        [majorScale]: {
            root: NoteNames;
            label: ChordNames;
        };
        [melMinScale]: {
            root: NoteNames;
            label: ChordNames;
        };
        [harMinScale]: {
            root: NoteNames;
            label: ChordNames;
        };
    }[] = [
        {
            position: [0, 0, 0],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: majorScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: melMinScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: harMinScale,
            },
        },
        {
            position: [1, 0, 0],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 2, 12)],
                label: melMinScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: majorScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: harMajScale,
            },
        },
        {
            position: [0, 1, 0],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 7, 12)],
                label: majorScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 7, 12)],
                label: harMajScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: melMinScale,
            },
        },
        {
            position: [0, 0, -1],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 5, 12)],
                label: majorScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 10, 12)],
                label: majorScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 3, 12)],
                label: majorScale,
            },
        },
        {
            position: [1, 1, 0],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 2, 12)],
                label: majorScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 7, 12)],
                label: majorScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 0, 12)],
                label: majorScale,
            },
        },
        {
            position: [1, 0, -1],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 2, 12)],
                label: harMinScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 5, 12)],
                label: majorScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 5, 12)],
                label: melMinScale,
            },
        },
        {
            position: [0, 1, -1],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 7, 12)],
                label: melMinScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 7, 12)],
                label: harMinScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 10, 12)],
                label: majorScale,
            },
        },
        {
            position: [1, 1, -1],
            [majorScale]: {
                root: NOTE_NAMES[mod(rootIdx + 2, 12)],
                label: harMajScale,
            },
            [melMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 7, 12)],
                label: melMinScale,
            },
            [harMinScale]: {
                root: NOTE_NAMES[mod(rootIdx + 5, 12)],
                label: majorScale,
            },
        },
    ];

    // loop over edgePairs, created default edge for each pair
    for (let i = 0; i < edgePairs.length; i++) {
        const pair = edgePairs[i];
        const start = adjustmentBank[pair[0]].position;
        const end = adjustmentBank[pair[1]].position;

        const ignoreMajor =
            name.endsWith(majorScale) && start[0] === 0 && end[0] === 0;
        const ignoreMelMinor =
            name.endsWith(melMinScale) && start[1] === 0 && end[1] === 0;
        const ignoreHarMinor =
            name.endsWith(harMinScale) && start[2] === -1 && end[2] === -1;

        if (ignoreMajor || ignoreMelMinor || ignoreHarMinor) {
            // dont make edges for ignored side of cube
            continue;
        }

        const startVertex = {
            position: [
                position[0] + start[0] * CUBE_SIZE,
                position[1] + start[1] * CUBE_SIZE,
                position[2] + start[2] * CUBE_SIZE,
            ] as PositionType,
            ...adjustmentBank[pair[0]][label],
        };

        const endVertex = {
            position: [
                position[0] + end[0] * CUBE_SIZE,
                position[1] + end[1] * CUBE_SIZE,
                position[2] + end[2] * CUBE_SIZE,
            ] as PositionType,
            ...adjustmentBank[pair[1]][label],
        };

        const edge = (
            <Edge
                key={`edge-group-${pair}`}
                appStore={appStore}
                layoutKey={`edge-${startVertex.root}-${startVertex.label}-${endVertex.root}-${endVertex.label}-${index}`}
                startVertex={startVertex}
                endVertex={endVertex}
            />
        );

        edges.push(edge);
    }

    return <>{edges}</>;
};

// create EdgeCubes for every cube of vertices/edges
export const Edges: React.FC<KeyCubeProps> = ({ appStore }) => {
    return (
        <>
            {Object.keys(CUBE_POSITIONS).map((name) => {
                const positions = CUBE_POSITIONS[name];
                return positions.map((position, i) => (
                    <EdgeCube
                        key={`box-${i}`}
                        appStore={appStore}
                        position={position}
                        index={i}
                        name={name}
                    />
                ));
            })}
        </>
    );
};

// KeyCube
export const KeyCube: React.FC<KeyCubeProps> = ({ appStore }) => {
    return (
        <div>
            <Canvas
                orthographic
                camera={{
                    position: STARTING_POS,
                    far: 100000,
                    near: CUBE_SIZE,
                }}
                style={{
                    height: "calc(100vh - 50px)",
                    width: "90vw",
                    margin: "0 auto",
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor("#000");
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = THREE.PCFSoftShadowMap;
                }}
            >
                <Lights />
                <Controls />
                <ScaleVertices appStore={appStore} />
                <Edges appStore={appStore} />
            </Canvas>
        </div>
    );
};
