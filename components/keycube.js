import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols";
import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
// import { useSpring, animated } from "react-spring/three";
import {
    NOTE_NAMES,
    CUBE_POSITIONS,
    CUBE_SIZE,
    SHAPES,
    MajorScale,
    MelminScale,
    HarminScale,
    HarmajScale,
} from "../consts";
import { getNotes, getPegs } from "../util";
import { fontJSON } from "../font";
import { COLORS } from "../colors";

extend({ OrbitControls });

const loader = new THREE.FontLoader();
const font = loader.parse(fontJSON);

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

const Box = ({ position, color }) => {
    // const [hovered, setHovered] = useState(false);
    // const [active, setActive] = useState(false);
    // const { position, color } = useSpring({
    //     position: [],
    //     color: "grey",
    // });

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

const Text = ({ position, text, color, options }) => {
    const mesh = useRef();
    // const [hovered, setHovered] = useState(false);
    // const [active, setActive] = useState(false);

    // const { position, text, color, options } = useSpring({
    //     position: [],
    //     text: "",
    //     color: "grey",
    //     options: {},
    // });

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.lookAt(state.camera.position);
            mesh.current.position.set(...position);
        }
    });

    let textOptions = {
        font,
        height: 5,
        ...options,
    };

    if (!font) return null;

    return (
        <mesh
            // onPointerOver={() => setHovered(true)}
            // onPointerOut={() => setHovered(false)}
            // onClick={() => setActive(!active)}
            position={position}
            castShadow
            ref={mesh}
        >
            <textGeometry attach="geometry" args={[text, textOptions]} />
            <meshPhysicalMaterial attach="material" color={color} />
        </mesh>
    );
};

export default (props) => {
    const size = CUBE_SIZE;
    const boxes = [];
    const noteNames = [];

    // refactor
    for (let i = 0; i < NOTE_NAMES.length * 2 + 3; i++) {
        const j = Math.floor(i / 3) * size;
        const position =
            i % 3 === 0
                ? [j, j, j]
                : i % 3 === 1
                ? [j, j, j + size]
                : [j, j + size, j + size];

        const negPosition =
            i % 3 === 0
                ? [-j, -j, -j]
                : i % 3 === 1
                ? [-j - size, -j, -j]
                : [-j - size, -j - size, -j];

        // fixes alignment issue between note vertices and boxes
        if (i < 2 * (NOTE_NAMES.length - 1)) {
            boxes.push(
                <Box position={position} key={`box-${i}`} color="grey" />
            );
        }

        if (i > 0) {
            boxes.push(
                <Box position={negPosition} key={`box-${i}-neg`} color="grey" />
            );
        }
    }

    for (let i = 0; i < NOTE_NAMES.length; i++) {
        let majorName = `${NOTE_NAMES[i]} ${MajorScale}`;
        let melMinorName = `${NOTE_NAMES[i]} ${MelminScale}`;
        let harMinorName = `${NOTE_NAMES[i]} ${HarminScale}`;
        let harMajorName = `${NOTE_NAMES[i]} ${HarmajScale}`;

        const majorPositions = CUBE_POSITIONS[majorName];
        const melMinorPositions = CUBE_POSITIONS[melMinorName];
        const harMinorPositions = CUBE_POSITIONS[harMinorName];
        const harMajorPositions = CUBE_POSITIONS[harMajorName];

        const getHighlightOptions = (root, scaleType) => {
            const DEFAULT_OPTIONS = {
                color: "grey",
                size: 10,
            };

            const HIGHLIGHT_OPTIONS = {
                color: COLORS(1)[0],
                size: 14,
            };
            const rootIdx = NOTE_NAMES.indexOf(root);
            if (rootIdx === -1) return DEFAULT_OPTIONS;

            for (let i in props.selected) {
                const selectedPegs = getPegs(props.selected[i]);
                const scaleNotes = getNotes(
                    SHAPES[scaleType]
                        .map((note) => (note + rootIdx) % 12)
                        .sort()
                );

                if (
                    selectedPegs.length &&
                    selectedPegs.every((val) => scaleNotes[val])
                ) {
                    HIGHLIGHT_OPTIONS.color = COLORS(1)[i];
                    return HIGHLIGHT_OPTIONS;
                }
            }

            return DEFAULT_OPTIONS;
        };

        const MajorOpts = getHighlightOptions(NOTE_NAMES[i], MajorScale);
        const MelminOpts = getHighlightOptions(NOTE_NAMES[i], MelminScale);
        const HarminOpts = getHighlightOptions(NOTE_NAMES[i], HarminScale);
        const HarmajOpts = getHighlightOptions(NOTE_NAMES[i], HarmajScale);

        for (let j in majorPositions) {
            noteNames.push(
                <Text
                    key={`${NOTE_NAMES[i]}-${MajorScale}-${j}`}
                    position={majorPositions[j]}
                    color={MajorOpts.color}
                    text={`${NOTE_NAMES[i]}\n${MajorScale}`}
                    options={MajorOpts}
                />
            );
        }
        for (let j in melMinorPositions) {
            noteNames.push(
                <Text
                    key={`${NOTE_NAMES[i]}-${MelminScale}-${j}`}
                    position={melMinorPositions[j]}
                    color={MelminOpts.color}
                    text={`${NOTE_NAMES[i]}\n${MelminScale}`}
                    options={MelminOpts}
                />
            );
        }
        for (let j in harMinorPositions) {
            noteNames.push(
                <Text
                    key={`${NOTE_NAMES[i]}-${HarminScale}-${j}`}
                    position={harMinorPositions[j]}
                    color={HarminOpts.color}
                    text={`${NOTE_NAMES[i]}\n${HarminScale}`}
                    options={HarminOpts}
                />
            );
        }
        for (let j in harMajorPositions) {
            noteNames.push(
                <Text
                    key={`${NOTE_NAMES[i]}-${HarmajScale}-${j}`}
                    position={harMajorPositions[j]}
                    color={HarmajOpts.color}
                    text={`${NOTE_NAMES[i]}\n${HarmajScale}`}
                    options={HarmajOpts}
                />
            );
        }
    }

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
            {noteNames}
            {boxes}
        </Canvas>
    );
};
