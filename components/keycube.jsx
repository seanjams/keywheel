import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
import {
    CUBE_POSITIONS,
    CUBE_SIZE,
    VERTEX_KEYS,
    NAME_TO_LABEL,
    VERTEX_POSITIONS_BY_KEY,
} from "../consts";
import { fontJSON } from "../font";
import { api } from "../store";

extend({ OrbitControls });

const loader = new THREE.FontLoader();
const font = loader.parse(fontJSON);

const DEFAULT_OPTIONS = {
    position: [],
    color: "",
    label: "",
    options: {},
};

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
            rotateSpeed={5}
            panSpeed={3}
            ref={orbitRef}
        />
    );
};

// Scale Vertices
export const TextNodes = () => {
    return (
        <>
            {VERTEX_KEYS.map((key) => (
                <Text key={key} name={key} />
            ))}
        </>
    );
};

export const Text = ({ name }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const optionsRef = useRef(DEFAULT_OPTIONS);
    const label = NAME_TO_LABEL[name];
    const position = VERTEX_POSITIONS_BY_KEY[name];

    useEffect(() =>
        api.subscribe(
            (options) => (optionsRef.current = options),
            (store) => store[name]
        )
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.lookAt(state.camera.position);
        }
        if (materialRef.current) {
            materialRef.current.color.set(optionsRef.current.color);
        }
    });

    return (
        <mesh position={position} castShadow ref={meshRef}>
            <textBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[label, { font, height: 5, size: 10 }]}
            />
            <meshPhysicalMaterial
                ref={materialRef}
                attach="material"
                color="grey"
            />
        </mesh>
    );
};

// Boxes
export const Box = ({ position, color }) => {
    const x = position[0] + CUBE_SIZE / 2;
    const y = position[1] + CUBE_SIZE / 2;
    const z = position[2] - CUBE_SIZE / 2;

    const boxGeometry = new THREE.BoxBufferGeometry(
        CUBE_SIZE,
        CUBE_SIZE,
        CUBE_SIZE
    );

    return (
        <lineSegments position={[x, y, z]}>
            <edgesGeometry attach="geometry" args={[boxGeometry]} />
            <lineBasicMaterial attach="material" color={color} />
        </lineSegments>
    );
};

export const Boxes = () => {
    return (
        <>
            {CUBE_POSITIONS.map((position, i) => (
                <Box position={position} key={`box-${i}`} color="grey" />
            ))}
        </>
    );
};

// KeyCube
export const KeyCube = () => {
    return (
        <Canvas
            orthographic
            // camera={{ position: [CUBE_SIZE, CUBE_SIZE, CUBE_SIZE], near: 1, far: 10000 }}
            camera={{
                position: [CUBE_SIZE * 10, CUBE_SIZE * 10, CUBE_SIZE * 10],
                // left: (CUBE_SIZE * 1) / -0.2,
                // right: (CUBE_SIZE * 1) / -0.2,
                // top: CUBE_SIZE / 0.2,
                // bottom: CUBE_SIZE / -0.2,
                far: 100000,
                near: CUBE_SIZE,
            }}
            style={{
                height: "40vw",
                width: "80vw",
            }}
            onCreated={({ gl }) => {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
        >
            <ambientLight intensity={0.5} />
            <spotLight position={[15, 20, 5]} penumbra={1} castShadow />
            <Controls />
            <TextNodes />
            <Boxes />
        </Canvas>
    );
};
