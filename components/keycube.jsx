import React, { useRef, useEffect, useContext } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
import { useSpring, animated } from "react-spring/three";
import {
    NOTE_NAMES,
    VERTEX_POSITIONS,
    CUBE_POSITIONS,
    CUBE_SIZE,
    SHAPES,
} from "../consts";
import { getNotes, getPegs } from "../util";
import { fontJSON } from "../font";
import { COLORS } from "../colors";
import { KeyWheelContext, useStore } from "../store";

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
            ref={orbitRef}
        />
    );
};

// builds object with key pointing to textGeometry props for specific vertix
const buildTextProps = (selected) => {
    const getHighlightOptions = (root, scaleType) => {
        const DEFAULT_OPTIONS = {
            color: "grey",
            size: 10,
        };

        const rootIdx = NOTE_NAMES.indexOf(root);
        if (rootIdx === -1) return DEFAULT_OPTIONS;

        for (let i in selected) {
            const selectedPegs = getPegs(selected[i]);
            const scaleNotes = getNotes(
                SHAPES[scaleType].map((note) => (note + rootIdx) % 12).sort()
            );

            if (
                selectedPegs.length &&
                selectedPegs.every((val) => scaleNotes[val])
            ) {
                return {
                    color: COLORS(1)[i],
                    size: 14,
                };
            }
        }

        return DEFAULT_OPTIONS;
    };

    const nextTextProps = {};
    for (let scaleName in VERTEX_POSITIONS) {
        // split only on first space
        let [root, scaleType] = scaleName.split(/\s(.+)/);

        const options = getHighlightOptions(root, scaleType);
        const positions = VERTEX_POSITIONS[scaleName];

        for (let j in positions) {
            let key = `${root}-${scaleType}-${j}`;
            let label = `${root}\n${scaleType}`;
            nextTextProps[key] = {
                position: positions[j],
                color: options.color,
                label,
                options,
            };
        }
    }

    return nextTextProps;
};

// Scale Vertices
export const TextNodes = () => {
    const textProps = useStore((state) => state.textProps);
    return (
        <>
            {Object.keys(textProps).map((key) => (
                <Text key={key} name={key} />
            ))}
        </>
    );
};

export const Text = ({ name }) => {
    const meshRef = useRef();
    const geometryRef = useRef();
    const materialRef = useRef();

    const { position = [], color = "", label = "", options = {} } = useStore(
        (state) => state.textProps[name] || {}
    );
    const textOptions = {
        font,
        height: 5,
        ...options,
    };

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.lookAt(state.camera.position);
            meshRef.current.position.set(...position);
        }
    });

    return (
        <animated.mesh position={position} castShadow ref={meshRef}>
            <textBufferGeometry
                ref={geometryRef}
                attach="geometry"
                args={[label, textOptions]}
            />
            <animated.meshPhysicalMaterial
                ref={materialRef}
                attach="material"
                color={color}
            />
        </animated.mesh>
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
        <animated.lineSegments position={[x, y, z]}>
            <edgesGeometry attach="geometry" args={[boxGeometry]} />
            <animated.lineBasicMaterial attach="material" color={color} />
        </animated.lineSegments>
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
    const { state } = useContext(KeyWheelContext);
    const { selected } = state;
    const setTextProps = useStore((store) => store.setTextProps);

    useEffect(() => {
        if (!selected) return;
        const nextTextProps = buildTextProps(selected);
        setTextProps(nextTextProps);
    }, [selected]);

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
