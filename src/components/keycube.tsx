import React, { useRef, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Text3D,
    Center,
    View,
    OrthographicCamera,
} from "@react-three/drei";
import { NOTE_NAMES } from "../consts";
import { darkGrey, grey, lightGrey, mediumGrey, red, yellow } from "../colors";
import { AppStore } from "../store/state";
import { ChordNames, NoteNames, PositionType, VertexType } from "../types";
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
        appStore.state.keyCubeThreeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS(),
    );

    useEffect(() => {
        return appStore.addListener(({ keyCubeThreeProps }) => {
            optionsRef.current =
                keyCubeThreeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS();
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
    const { keyCubeThreeProps, layoutDisabledKeys } = appStore.state;

    const optionsRef = useRef(
        keyCubeThreeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS(),
    );
    const layoutDisabledRef = useRef(layoutDisabledKeys[layoutKey] || false);

    useEffect(() => {
        return appStore.addListener(
            ({ keyCubeThreeProps, layoutDisabledKeys }) => {
                layoutDisabledRef.current =
                    layoutDisabledKeys[layoutKey] || false;
                optionsRef.current =
                    keyCubeThreeProps[name] || DEFAULT_NOTE_COLOR_OPTIONS();
            },
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
    const { keyCubeVertices } = appStore.state;
    const { root, label, position, scaleType } = keyCubeVertices[name];
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
    const { keyCubeVertices } = appStore.state;
    return (
        <>
            {Object.keys(keyCubeVertices).map((key) => (
                <ScaleVertex key={key} appStore={appStore} name={key} />
            ))}
        </>
    );
};

interface EdgeProps extends KeyCubeProps {
    startVertex: VertexType;
    endVertex: VertexType;
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
    const { keyCubeThreeProps, layoutDisabledKeys, edgeSize } = appStore.state;
    const startOptionsRef = useRef(
        keyCubeThreeProps[startVertex.key] || DEFAULT_NOTE_COLOR_OPTIONS(),
    );
    const endOptionsRef = useRef(
        keyCubeThreeProps[endVertex.key] || DEFAULT_NOTE_COLOR_OPTIONS(),
    );
    const layoutDisabledRef = useRef(layoutDisabledKeys[layoutKey] || false);

    useEffect(() => {
        return appStore.addListener(
            ({ keyCubeThreeProps, layoutDisabledKeys }) => {
                startOptionsRef.current =
                    keyCubeThreeProps[startVertex.key] ||
                    DEFAULT_NOTE_COLOR_OPTIONS();
                endOptionsRef.current =
                    keyCubeThreeProps[endVertex.key] ||
                    DEFAULT_NOTE_COLOR_OPTIONS();
                layoutDisabledRef.current =
                    layoutDisabledKeys[layoutKey] || false;
            },
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
            geometryRef.current.translate(0, edgeSize / 2, 0);
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
            <cylinderGeometry ref={geometryRef} args={[3, 3, edgeSize, 16]} />
            <meshPhongMaterial ref={materialRef} color={mediumGrey} />
        </mesh>
    );
};

// create EdgeCubes for every cube of vertices/edges
export const Edges: React.FC<KeyCubeProps> = ({ appStore }) => {
    const edges: React.JSX.Element[] = [];
    const { keyCubeConnections, keyCubeVertices } = appStore.state;

    // loop over edgePairs, created default edge for each pair
    for (let i = 0; i < keyCubeConnections.length; i++) {
        const connection = keyCubeConnections[i];
        if (
            keyCubeVertices[connection[0]] === undefined ||
            keyCubeVertices[connection[1]] === undefined
        ) {
            continue;
        }

        const start = keyCubeVertices[connection[0]];
        const end = keyCubeVertices[connection[1]];

        const edge = (
            <Edge
                key={`edge-group-${connection}`}
                appStore={appStore}
                layoutKey={`edge-${start.key}-${end.key}`}
                startVertex={start}
                endVertex={end}
            />
        );

        edges.push(edge);
    }

    return <>{edges}</>;
};

// KeyCube
export const KeyCube: React.FC<KeyCubeProps> = ({ appStore }) => {
    const keyCubeDivRef = useRef<HTMLDivElement>(null);
    const { edgeSize, keyCubeStartingPos } = appStore.state;
    return (
        <div
            ref={keyCubeDivRef}
            style={{
                height: "calc(100vh - 50px)",
                width: "90vw",
                margin: "0 auto",
                backgroundColor: "#000",
            }}
        >
            <View
                track={keyCubeDivRef as React.RefObject<HTMLDivElement>}
                style={{
                    height: "calc(100vh - 50px)",
                    width: "90vw",
                    margin: "0 auto",
                }}
            >
                <OrthographicCamera
                    makeDefault
                    position={keyCubeStartingPos}
                    far={100000}
                    near={edgeSize}
                />
                <Lights />
                <Controls />
                <ScaleVertices appStore={appStore} />
                <Edges appStore={appStore} />
            </View>
        </div>
    );
};
