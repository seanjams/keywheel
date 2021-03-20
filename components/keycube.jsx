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
import { grey, darkGrey, lightGrey, mediumGrey, red, yellow } from "../colors";
import { fontJSON } from "../font";
import { useStore, api } from "../store";
import { DEFAULT_NOTE_COLOR_OPTIONS, mod } from "../util";

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

// main sphere of scale vertex
export const ScaleBall = ({ name, layoutKey }) => {
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
                materialRef.current.color.set(yellow);
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

// text on scale ball
export const ScaleText = ({ label, name, layoutKey }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const { set, [layoutKey]: layoutDisabled } = useStore.getState() || {};
    const layoutDisabledRef = useRef(layoutDisabled || false);

    useEffect(() => {
        return api.subscribe(
            ({ layoutDisabled }) => {
                layoutDisabledRef.current = layoutDisabled;
            },
            (store) => ({
                layoutDisabled: store[layoutKey],
            })
        );
    }, []);

    // useFrame((state) => {
    //     // things that should happen on every render
    // });

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting
        if (layoutDisabledRef.current) return;

        if (meshRef.current) {
            // move scale name along the z axis of sphere to its edge
            const t = new THREE.Vector3(0, 0, 1);
            meshRef.current.translateOnAxis(t, 19.5);
        }

        if (geometryRef.current) {
            // make scale name centered on outer sphere
            geometryRef.current.center();
        }

        layoutDisabledRef.current = true;
        set({ [layoutKey]: layoutDisabledRef.current });
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

// little notes for each scale
export const NoteBall = ({ name, index, layoutKey }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const { set, [layoutKey]: layoutDisabled, [name]: options } =
        useStore.getState() || {};
    // const [active, setActive] = useState(false);

    const optionsRef = useRef(options || DEFAULT_NOTE_COLOR_OPTIONS);
    const layoutDisabledRef = useRef(layoutDisabled || false);

    useEffect(() => {
        return api.subscribe(
            ({ options, layoutDisabled }) => {
                optionsRef.current = options;
                layoutDisabledRef.current = layoutDisabled;
            },
            (store) => ({
                options: store[name],
                layoutDisabled: store[layoutKey],
            })
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
        set({ [layoutKey]: layoutDisabledRef.current });
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

// text on note ball
export const NoteText = ({ name, index, layoutKey }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const { set, [layoutKey]: layoutDisabled } = useStore.getState() || {};
    const layoutDisabledRef = useRef(layoutDisabled || false);

    useEffect(() => {
        return api.subscribe(
            ({ layoutDisabled }) => {
                layoutDisabledRef.current = layoutDisabled;
            },
            (store) => ({
                layoutDisabled: store[layoutKey],
            })
        );
    }, []);

    // useFrame((state) => {
    // things that should happen on every render
    // });

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

        if (geometryRef.current) {
            // make note names centered on note balls
            geometryRef.current.center();
        }

        layoutDisabledRef.current = true;
        set({ [layoutKey]: layoutDisabledRef.current });
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

// a sphere with text and little noteballs on it
export const ScaleVertex = ({ name }) => {
    const groupRef = useRef();
    const { label, position } = VERTICES[name];

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
        <ScaleBall key={ballKey} layoutKey={ballKey} name={name} />
    );
    const scaleText = (
        <ScaleText
            key={textKey}
            layoutKey={textKey}
            name={name}
            label={label}
        />
    );

    // build default noteballs
    const noteBalls = [];
    const noteTexts = [];
    for (let i = 0; i < 12; i++) {
        ballKey = `note-ball-${name}-${i}`;
        textKey = `note-text-${name}-${i}`;
        noteBalls.push(
            <NoteBall key={ballKey} layoutKey={ballKey} name={name} index={i} />
        );
        noteTexts.push(
            <NoteText key={textKey} layoutKey={textKey} name={name} index={i} />
        );
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
export const ScaleVertices = () => {
    return (
        <>
            {Object.keys(VERTICES).map((key) => (
                <ScaleVertex key={key} name={key} />
            ))}
        </>
    );
};

// An edge from start node => end node
export const Edge = ({ color, startVertex, endVertex, layoutKey }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const startKey = `${startVertex.root}-${startVertex.label}-0`;
    const endKey = `${endVertex.root}-${endVertex.label}-0`;
    const {
        set,
        [startKey]: startOpts,
        [endKey]: endOpts,
        [layoutKey]: layoutDisabled,
    } = useStore.getState() || {};
    const startOptionsRef = useRef(startOpts || DEFAULT_NOTE_COLOR_OPTIONS);
    const endOptionsRef = useRef(endOpts || DEFAULT_NOTE_COLOR_OPTIONS);
    const layoutDisabledRef = useRef(layoutDisabled || false);

    useEffect(() => {
        return api.subscribe(
            ({ startOpts, endOpts, layoutDisabled }) => {
                startOptionsRef.current = startOpts;
                endOptionsRef.current = endOpts;
                layoutDisabledRef.current = layoutDisabled;
            },
            (store) => ({
                startOpts: store[startKey],
                endOpts: store[endKey],
                layoutDisabled: store[layoutKey],
            })
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
                materialRef.current.color.set(red);
            } else {
                materialRef.current.color.set(mediumGrey);
            }
        }
    });

    useLayoutEffect((state) => {
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
        set({ [layoutKey]: layoutDisabledRef.current });
    });

    return (
        <mesh position={startVertex.position} ref={meshRef} castShadow>
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

// Boxes of edges
export const EdgeCube = ({ position, color, name, index }) => {
    const edges = [];
    const [root, label] = name.split("\n");
    const rootIdx = NOTE_NAMES.indexOf(root);

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

    const adjustmentBank = [
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
            ],
            ...adjustmentBank[pair[0]][label],
        };

        const endVertex = {
            position: [
                position[0] + end[0] * CUBE_SIZE,
                position[1] + end[1] * CUBE_SIZE,
                position[2] + end[2] * CUBE_SIZE,
            ],
            ...adjustmentBank[pair[1]][label],
        };

        const edge = (
            <Edge
                key={`edge-group-${pair}`}
                color={color}
                layoutKey={`edge-${startVertex.root}-${startVertex.label}-${endVertex.root}-${endVertex.label}-${index}`}
                index={index}
                startVertex={startVertex}
                endVertex={endVertex}
            />
        );

        edges.push(edge);
    }

    return <>{edges}</>;
};

// create EdgeCubes for every cube of vertices/edges
export const Edges = () => {
    return (
        <>
            {Object.keys(CUBE_POSITIONS).map((name) => {
                const positions = CUBE_POSITIONS[name];
                return positions.map((position, i) => (
                    <EdgeCube
                        position={position}
                        key={`box-${i}`}
                        index={i}
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
