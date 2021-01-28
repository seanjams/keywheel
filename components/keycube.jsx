import React, { useRef, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
import {
    CUBE_POSITIONS,
    CUBE_SIZE,
    STARTING_POS,
    NOTE_NAMES,
    VERTICES,
} from "../consts";
import { DEFAULT_NOTE_COLOR_OPTIONS } from "../util";
import { grey, darkGrey, lightGrey, lighterGrey } from "../colors";
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

export const ScaleVertex = ({ name }) => {
    const groupRef = useRef();

    const scaleMeshRef = useRef();
    const scaleGeometryRef = useRef();
    const scaleMaterialRef = useRef();

    const scaleTextMeshRef = useRef();
    const scaleTextGeometryRef = useRef();
    const scaleTextMaterialRef = useRef();

    const noteBalls = [];
    const noteBallRefs = [];

    const noteTexts = [];
    const noteTextRefs = [];

    const optionsRef = useRef(
        useStore.getState()[name] || DEFAULT_NOTE_COLOR_OPTIONS
    );

    const { label, position } = VERTICES[name];

    useEffect(() => {
        return api.subscribe(
            (options) => (optionsRef.current = options),
            (store) => store[name]
        );
    }, []);

    useFrame((state) => {
        // things that should happen on every render

        if (groupRef.current) {
            groupRef.current.lookAt(state.camera.position);
        }

        for (let i = 0; i < noteBallRefs.length; i++) {
            const [
                ballMeshRef,
                ballGeometryRef,
                ballMaterialRef,
            ] = noteBallRefs[i];

            if (ballMaterialRef.current) {
                const options = optionsRef.current[i];
                ballMaterialRef.current.color.set(options[options.length - 1]);
            }
        }
    });

    useLayoutEffect(() => {
        // things that should happen on first render cylce after mounting

        for (let i = 0; i < noteBallRefs.length; i++) {
            const [
                ballMeshRef,
                ballGeometryRef,
                ballMaterialRef,
            ] = noteBallRefs[i];

            const [
                textMeshRef,
                textGeometryRef,
                textMaterialRef,
            ] = noteTextRefs[i];

            let x = Math.sin((2 * i * Math.PI) / 12);
            let y = Math.cos((2 * i * Math.PI) / 12);

            const v = new THREE.Vector3(x, y, 1);
            const z = new THREE.Vector3(x, y, 1.25); // leads to slightly narrower cone
            v.normalize();
            z.normalize();

            if (ballMeshRef.current) {
                ballMeshRef.current.translateOnAxis(v, 20);
            }

            if (textMeshRef.current) {
                textMeshRef.current.translateOnAxis(z, 23);
            }

            if (textGeometryRef.current) {
                textGeometryRef.current.center();
            }
        }

        if (scaleTextMeshRef.current) {
            const t = new THREE.Vector3(0, 0, 1);
            scaleTextMeshRef.current.translateOnAxis(t, 19.5);
        }

        if (scaleTextGeometryRef.current) {
            scaleTextGeometryRef.current.center();
        }
    });

    const scaleBall = (
        <mesh castShadow ref={scaleMeshRef} key={`corner-${name}`}>
            <sphereBufferGeometry
                ref={scaleGeometryRef}
                attach="geometry"
                args={[20, 32, 16]}
            />
            <meshPhongMaterial
                ref={scaleMaterialRef}
                attach="material"
                color={lightGrey}
            />
        </mesh>
    );

    const scaleText = (
        <mesh castShadow ref={scaleTextMeshRef}>
            <textBufferGeometry
                ref={scaleTextGeometryRef}
                attach="geometry"
                args={[label, { font, height: 2, size: 4 }]}
            />
            <meshPhysicalMaterial
                ref={scaleTextMaterialRef}
                attach="material"
                color={darkGrey}
            />
        </mesh>
    );

    for (let i = 0; i < 12; i++) {
        const noteBallMeshRef = useRef();
        const noteBallGeometryRef = useRef();
        const noteBallMaterialRef = useRef();

        const noteTextMeshRef = useRef();
        const noteTextGeometryRef = useRef();
        const noteTextMaterialRef = useRef();

        const noteBall = (
            <mesh
                castShadow
                ref={noteBallMeshRef}
                key={`note-ball-${name}-${i}`}
            >
                <sphereBufferGeometry
                    ref={noteBallGeometryRef}
                    attach="geometry"
                    args={[4, 32, 16]}
                />
                <meshPhongMaterial
                    ref={noteBallMaterialRef}
                    attach="material"
                    color={lightGrey}
                    reflectivity={1}
                />
            </mesh>
        );

        const noteText = (
            <mesh
                castShadow
                ref={noteTextMeshRef}
                key={`note-text-${name}-${i}`}
            >
                <textBufferGeometry
                    ref={noteTextGeometryRef}
                    attach="geometry"
                    args={[NOTE_NAMES[i], { font, height: 1, size: 2 }]}
                />
                <meshPhysicalMaterial
                    ref={noteTextMaterialRef}
                    attach="material"
                    color={darkGrey}
                />
            </mesh>
        );

        noteBallRefs.push([
            noteBallMeshRef,
            noteBallGeometryRef,
            noteBallMaterialRef,
        ]);

        noteTextRefs.push([
            noteTextMeshRef,
            noteTextGeometryRef,
            noteTextMaterialRef,
        ]);

        noteBalls.push(noteBall);
        noteTexts.push(noteText);
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

// Boxes
export const Edge = ({ position, color }) => {
    const edgeRefs = [];

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

    const x = position[0];
    const y = position[1];
    const z = position[2];

    const edges = [];
    for (let pair of edgePairs) {
        const edgeMeshRef = useRef();
        const edgeGeometryRef = useRef();
        const edgeMaterialRef = useRef();
        const d = cornerPositions[pair[0]];

        const edgePosition = [
            x + d[0] * CUBE_SIZE,
            y + d[1] * CUBE_SIZE,
            z + d[2] * CUBE_SIZE,
        ];

        const edge = (
            <mesh
                position={edgePosition}
                ref={edgeMeshRef}
                key={`edge-${pair}`}
                castShadow
            >
                <cylinderBufferGeometry
                    ref={edgeGeometryRef}
                    attach="geometry"
                    args={[3, 3, CUBE_SIZE, 16]}
                />
                <meshPhongMaterial
                    ref={edgeMaterialRef}
                    attach="material"
                    color={lighterGrey}
                />
            </mesh>
        );

        edges.push(edge);
        edgeRefs.push([edgeMeshRef, edgeMaterialRef, edgeGeometryRef]);
    }

    useLayoutEffect((state) => {
        for (let j = 0; j < edgeRefs.length; j++) {
            let start = cornerPositions[edgePairs[j][0]];
            start = new THREE.Vector3(
                x + start[0] * CUBE_SIZE,
                y + start[1] * CUBE_SIZE,
                z + start[2] * CUBE_SIZE
            );

            let end = cornerPositions[edgePairs[j][1]];
            end = new THREE.Vector3(
                x + end[0] * CUBE_SIZE,
                y + end[1] * CUBE_SIZE,
                z + end[2] * CUBE_SIZE
            );

            const [meshRef, materialRef, geometryRef] = edgeRefs[j];
            if (meshRef.current) {
                meshRef.current.position.copy(start);
                meshRef.current.lookAt(end);
            }

            if (geometryRef.current) {
                geometryRef.current.translate(0, CUBE_SIZE / 2, 0);
                geometryRef.current.rotateX(Math.PI / 2);
            }
        }
    });

    return <>{edges}</>;
};

export const Edges = () => {
    return (
        <>
            {CUBE_POSITIONS.map((position, i) => (
                <Edge position={position} key={`box-${i}`} color={grey} />
            ))}
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
