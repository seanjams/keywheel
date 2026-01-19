import React, { useRef, CSSProperties, useState } from "react";
import { View, OrthographicCamera } from "@react-three/drei";

import { lighterGrey, lightGrey } from "../../colors";
import { AppStore } from "../../store/state";
import { ChordNames } from "../../types";
import { Controls, Edges, Lights, ScaleVertices } from "./common";
import { ChordCubeNames, SceneKey } from "../../store/types";

interface ChordCubeProps {
    appStore: AppStore;
}

const buttonStyle: CSSProperties = {
    padding: "5px",
    backgroundColor: lightGrey,
    margin: "5px",
    textAlign: "center",
    minWidth: "60px",
    height: "30px",
    fontSize: "0.8rem",
    border: 0,
    borderRadius: "3px",
};

// ChordCube
export const ChordCube: React.FC<ChordCubeProps> = ({ appStore }) => {
    const chordCubeDivRef = useRef<HTMLDivElement>(null);
    const { edgeSize, startingPos } = appStore.state.chordCube;

    const chordNames: ChordCubeNames[] = [
        ChordNames.maj7Chord,
        ChordNames.min7Chord,
        ChordNames.domChord,
        ChordNames.min7b5Chord,
        ChordNames.minMajChord,
        ChordNames.majAugChord,
        ChordNames.domAugChord,
        ChordNames.domb5Chord,
        ChordNames.dim7Chord,
        ChordNames.augChord,
    ];

    const [isVisible, setIsVisible] = useState<Record<ChordCubeNames, boolean>>(
        {
            [ChordNames.maj7Chord]: true,
            [ChordNames.min7Chord]: true,
            [ChordNames.domChord]: true,
            [ChordNames.min7b5Chord]: true,
            [ChordNames.minMajChord]: true,
            [ChordNames.majAugChord]: true,
            [ChordNames.domAugChord]: true,
            [ChordNames.domb5Chord]: true,
            [ChordNames.dim7Chord]: true,
            [ChordNames.augChord]: true,
        },
    );

    const toggleVisible = (chordName: keyof typeof isVisible) => {
        const shouldHide = isVisible[chordName];
        appStore.dispatch.hideVertices(
            SceneKey.chordCube,
            chordName,
            shouldHide,
        );
        setIsVisible({
            ...isVisible,
            [chordName]: !isVisible[chordName],
        });
    };

    return (
        <div
            ref={chordCubeDivRef}
            style={{
                height: "calc(100vh - 50px)",
                width: "90vw",
                margin: "0 auto",
                backgroundColor: "#000",
            }}
        >
            <div
                style={{
                    background: lighterGrey,
                    borderRadius: "4px",
                    height: "50px",
                    width: "fit-content",
                    position: "relative",
                    top: "20px",
                    left: "20px",
                    marginBottom: "-120px",
                    zIndex: "9999",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                }}
            >
                {chordNames.map((chordName) => (
                    <button
                        key={`visible-button-${chordName}`}
                        style={buttonStyle}
                        onClick={() => toggleVisible(chordName)}
                    >
                        {chordName}
                    </button>
                ))}
            </div>
            <View
                track={chordCubeDivRef as React.RefObject<HTMLDivElement>}
                style={{
                    height: "calc(100vh - 50px)",
                    width: "90vw",
                    margin: "0 auto",
                }}
            >
                <OrthographicCamera
                    makeDefault
                    position={startingPos}
                    far={100000}
                    near={edgeSize}
                />
                <Lights />
                <Controls />
                <ScaleVertices appStore={appStore} scene={SceneKey.chordCube} />
                <Edges appStore={appStore} scene={SceneKey.chordCube} />
            </View>
        </div>
    );
};
