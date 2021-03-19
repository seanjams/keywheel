import React, {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    useMemo,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
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
import { DEFAULT_NOTE_COLOR_OPTIONS, mod } from "../util";
import {
    grey,
    darkGrey,
    lightGrey,
    lighterGrey,
    white,
    mediumGrey,
} from "../colors";
import { fontJSON } from "../font";
import { useStore, api } from "../store";

extend({ OrbitControls });

const loader = new THREE.FontLoader();
const font = loader.parse(fontJSON);

// TODO: add drag reposition controls
const Controls = () => {
    const orbitRef = useRef();
    const { camera, gl } = useThree();

    useFrame(() => {
        orbitRef.current.update();
    });

    return (
        <orbitControls
            // maxPolarAngle={Math.PI / 3}
            // minPolarAngle={Math.PI / 3}
            args={[camera, gl.domElement]}
            rotateSpeed={3}
            panSpeed={1}
            ref={orbitRef}
        />
    );
};

const Lights = () => {
    const lightRef = useRef();

    useFrame((state) => {
        if (lightRef.current) {
            lightRef.current.position.copy(state.camera.position);
        }
    });

    return (
        <>
            <spotLight ref={lightRef} penumbra={0.7} castShadow />
            <ambientLight intensity={0.1} />
        </>
    );
};

// const context = React.createContext();
// const Outline = ({ children, active }) => {
//     const { gl, scene, camera, size } = useThree();
//     const composer = useRef();
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

export const ScaleBall = ({ name }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();

    const optionsRef = useRef(
        useStore.getState()[name] || DEFAULT_NOTE_COLOR_OPTIONS
    );

    useEffect(() => {
        return api.subscribe(
            (options) => (optionsRef.current = options),
            (store) => store[name]
        );
    }, []);

    useFrame((state) => {
        // things that should happen on every render

        // change outer sphere of scale vertex
        if (materialRef.current) {
            const options = optionsRef.current;
            if (options.some((option) => option.length > 1)) {
                materialRef.current.color.set("#8add6f");
            } else {
                materialRef.current.color.set(mediumGrey);
            }
        }
    });

    // useLayoutEffect(() => {
    //     // things that should happen on first render cylce after mounting
    // });

    // build default outer sphere
    return (
        <mesh castShadow ref={meshRef}>
            <sphereBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[20, 32, 16]}
            />
            <meshPhongMaterial
                ref={materialRef}
                attach="material"
                color={mediumGrey}
            />
        </mesh>
    );
};

export const ScaleText = ({ label }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();

    // useFrame((state) => {
    //     // things that should happen on every render
    // });

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting

        if (meshRef.current) {
            // move scale name along the z axis of sphere to its edge
            const t = new THREE.Vector3(0, 0, 1);
            meshRef.current.translateOnAxis(t, 19.5);
        }

        if (geometryRef.current) {
            // make scale name centered on outer sphere
            geometryRef.current.center();
        }
    });

    return (
        <mesh castShadow ref={meshRef}>
            <textBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[label, { font, height: 2, size: 4 }]}
            />
            <meshPhysicalMaterial
                ref={materialRef}
                attach="material"
                color={darkGrey}
            />
        </mesh>
    );
};

export const NoteBall = ({ name, index }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const [active, setActive] = useState(false);

    const optionsRef = useRef(
        useStore.getState()[name] || DEFAULT_NOTE_COLOR_OPTIONS
    );

    useEffect(() => {
        return api.subscribe(
            (options) => (optionsRef.current = options),
            (store) => store[name]
        );
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

        // create directional vectors from center of outer sphere to build note clock
        let x = Math.sin((2 * index * Math.PI) / 12);
        let y = Math.cos((2 * index * Math.PI) / 12);

        // these make a 12-pointed cone shape around the z axis of the outer sphere
        const v = new THREE.Vector3(x, y, 1);
        v.normalize();
        if (meshRef.current) {
            meshRef.current.translateOnAxis(v, 20);
        }
    });

    return (
        // <Outline active={active}>
        <mesh castShadow ref={meshRef}>
            <sphereBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[4, 32, 16]}
            />
            <meshPhongMaterial
                ref={materialRef}
                attach="material"
                color={lightGrey}
                reflectivity={1}
            />
        </mesh>
        // </Outline>
    );
};

export const NoteText = ({ index }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();

    // useFrame((state) => {
    // things that should happen on every render
    // });

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting

        // create directional vectors from center of outer sphere to build note clock
        let x = Math.sin((2 * index * Math.PI) / 12);
        let y = Math.cos((2 * index * Math.PI) / 12);

        // this one is slightly narrower and further out for the text to rest on the note balls
        const z = new THREE.Vector3(x, y, 1.25);
        z.normalize();
        if (meshRef.current) {
            meshRef.current.translateOnAxis(z, 23);
        }

        if (geometryRef.current) {
            // make note names centered on note balls
            geometryRef.current.center();
        }
    });

    return (
        <mesh castShadow ref={meshRef}>
            <textBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[NOTE_NAMES[index], { font, height: 1, size: 2 }]}
            />
            <meshPhysicalMaterial
                ref={materialRef}
                attach="material"
                color={darkGrey}
            />
        </mesh>
    );
};

export const ScaleVertex = ({ name }) => {
    const groupRef = useRef();

    const noteBalls = [];
    const noteTexts = [];

    const { label, position } = VERTICES[name];

    useFrame((state) => {
        // things that should happen on every render

        // keep group always facing camera (z axis)
        if (groupRef.current) {
            groupRef.current.lookAt(state.camera.position);
        }
    });

    // build default outer sphere
    const scaleBall = <ScaleBall key={`scale-ball-${name}`} name={name} />;
    const scaleText = <ScaleText key={`scale-text-${name}`} label={label} />;

    // build default noteballs
    for (let i = 0; i < 12; i++) {
        noteBalls.push(
            <NoteBall key={`note-ball-${name}-${i}`} name={name} index={i} />
        );
        noteTexts.push(<NoteText key={`note-text-${name}-${i}`} index={i} />);
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

// Scale Vertices
export const ScaleVertices = () => {
    return (
        <>
            {Object.keys(VERTICES).map((key) => (
                <ScaleVertex key={key} name={key} />
            ))}
        </>
    );
};

// create Edge class that abstracts away hooks
export const Edge = ({ color, startOptions, endOptions }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const startKey = `${startOptions.root}-${startOptions.label}-0`;
    const endKey = `${endOptions.root}-${endOptions.label}-0`;

    const startOptionsRef = useRef(
        useStore.getState()[startKey] || DEFAULT_NOTE_COLOR_OPTIONS
    );
    const endOptionsRef = useRef(
        useStore.getState()[endKey] || DEFAULT_NOTE_COLOR_OPTIONS
    );

    useEffect(() => {
        return api.subscribe(
            ({ startOpts, endOpts }) => {
                startOptionsRef.current = startOpts;
                endOptionsRef.current = endOpts;
            },
            (store) => ({ startOpts: store[startKey], endOpts: store[endKey] })
        );
    }, []);

    useFrame((state) => {
        // things that should happen on every render

        // change outer sphere of scale vertex
        if (materialRef.current) {
            if (
                startOptionsRef.current.some((option) => option.length > 1) &&
                endOptionsRef.current.some((option) => option.length > 1)
            ) {
                materialRef.current.color.set("#FF0000");
            } else {
                materialRef.current.color.set(mediumGrey);
            }
        }
    });

    useLayoutEffect((state) => {
        // things that should happen on first render cylce after mounting

        // get corners from edgePair and orient the mesh/geometry of each edge to look from start => end
        let start = new THREE.Vector3(...startOptions.position);
        let end = new THREE.Vector3(...endOptions.position);

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
    });

    return (
        <mesh position={startOptions.position} ref={meshRef} castShadow>
            <cylinderBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[3, 3, CUBE_SIZE, 16]}
            />
            <meshPhongMaterial
                ref={materialRef}
                attach="material"
                color={mediumGrey}
            />
        </mesh>
    );
};

// Boxes
export const EdgeCube = ({ position, color, name }) => {
    const edges = [];
    const [root, label] = name.split("\n");
    const rootIdx = NOTE_NAMES.indexOf(root);

    // relative coordinates of surrounding corners
    const cornerPositions = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, -1],
        [1, 1, 0],
        [1, 0, -1],
        [0, 1, -1],
        [1, 1, -1],
    ];

    // pairs of indices of cornerPositions array that should have an edge between them
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

    const adjustmentBank = [
        {
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

    const x = position[0];
    const y = position[1];
    const z = position[2];

    // loop over edgePairs, created default edge for each pair
    for (let i = 0; i < edgePairs.length; i++) {
        const pair = edgePairs[i];
        const start = cornerPositions[pair[0]];
        const end = cornerPositions[pair[1]];

        const startPosition = [
            x + start[0] * CUBE_SIZE,
            y + start[1] * CUBE_SIZE,
            z + start[2] * CUBE_SIZE,
        ];

        const endPosition = [
            x + end[0] * CUBE_SIZE,
            y + end[1] * CUBE_SIZE,
            z + end[2] * CUBE_SIZE,
        ];

        if (name.endsWith(melMinScale)) {
            // dont make edges for y-side
            if (start[1] === 0 && end[1] === 0) continue;
        } else if (
            name.endsWith(harMinScale) &&
            start[2] === -1 &&
            end[2] === -1
        ) {
            // dont make edges for z-side
            continue;
        } else if (
            name.endsWith(majorScale) &&
            start[0] === 0 &&
            end[0] === 0
        ) {
            // dont make edges for x-side
            continue;
        }

        const startOptions = {
            position: startPosition,
            ...adjustmentBank[pair[0]][label],
        };

        const endOptions = {
            position: endPosition,
            ...adjustmentBank[pair[1]][label],
        };

        const edge = (
            <Edge
                key={`edge-group-${pair}`}
                color={color}
                startOptions={startOptions}
                endOptions={endOptions}
            />
        );

        edges.push(edge);
    }

    return <>{edges}</>;
};

export const Edges = () => {
    return (
        <>
            {Object.keys(CUBE_POSITIONS).map((name) => {
                const positions = CUBE_POSITIONS[name];
                return positions.map((position, i) => (
                    <EdgeCube
                        position={position}
                        key={`box-${i}`}
                        name={name}
                        color={grey}
                    />
                ));
            })}
        </>
    );
};

// KeyCube
export const KeyCube = () => {
    const keyCubeVisible = useStore((store) => store.keyCubeVisible);
    return (
        <div style={{ marginLeft: "10vw" }}>
            {keyCubeVisible && (
                <Canvas
                    orthographic
                    camera={{
                        position: STARTING_POS,
                        far: 100000,
                        near: CUBE_SIZE,
                    }}
                    style={{
                        height: "50vw",
                        width: "80vw",
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
                    <ScaleVertices />
                    <Edges />
                    {/* <axesHelper
                        args={[
                            100 * CUBE_SIZE,
                            100 * CUBE_SIZE,
                            `white`,
                            `gray`,
                        ]}
                    /> */}
                </Canvas>
            )}
        </div>
    );
};
