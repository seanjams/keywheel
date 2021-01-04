import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
import { CUBE_POSITIONS, CUBE_SIZE, VERTICES } from "../consts";
import { DEFAULT_TEXT_COLOR } from "../colors";
import { fontJSON } from "../font";
import { useStore, api } from "../store";

extend({ OrbitControls });

const loader = new THREE.FontLoader();
const font = loader.parse(fontJSON);

const DEFAULT_OPTIONS = {
    color: DEFAULT_TEXT_COLOR,
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
            {Object.keys(VERTICES).map((key) => (
                <Text key={key} name={key} />
            ))}
        </>
    );
};

export const Text = ({ name }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();
    const { label, position } = VERTICES[name];
    const optionsRef = useRef(useStore.getState()[name] || DEFAULT_OPTIONS);

    useEffect(() => {
        return api.subscribe(
            (options) => (optionsRef.current = options),
            (store) => store[name]
        );
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.lookAt(state.camera.position);
            // console.log(state.camera.position);
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
                color={DEFAULT_TEXT_COLOR}
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
    const keyCubeVisible = useStore((store) => store.keyCubeVisible);
    return (
        <>
            {keyCubeVisible && (
                <Canvas
                    orthographic
                    camera={{
                        position: [
                            CUBE_SIZE * -20,
                            CUBE_SIZE * -12,
                            CUBE_SIZE * 29,
                        ],
                        // left: (CUBE_SIZE * 1) / -0.2,
                        // right: (CUBE_SIZE * 1) / -0.2,
                        // top: CUBE_SIZE / 0.2,
                        // bottom: CUBE_SIZE / -0.2,
                        far: 100000,
                        near: CUBE_SIZE,
                    }}
                    style={{
                        height: "50vw",
                        width: "90vw",
                        margin: "0 auto",
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
            )}
        </>
    );
};
