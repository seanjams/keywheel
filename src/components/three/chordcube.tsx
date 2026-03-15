import React, { useRef } from "react";
import { View, OrthographicCamera } from "@react-three/drei";
import { AppStore } from "../../store/state";
import { ChordNames } from "../../types";
import { Controls, Edges, Lights, ScaleVertices } from "./common";
import { SceneKey } from "../../store/types";
import { ToolBar } from "./toolbar";

interface ChordCubeProps {
    appStore: AppStore;
}

// ChordCube
export const ChordCube: React.FC<ChordCubeProps> = ({ appStore }) => {
    const chordCubeDivRef = useRef<HTMLDivElement>(null);
    const { edgeSize, startingPos } = appStore.state.chordCube;

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
            <ToolBar
                appStore={appStore}
                scene={SceneKey.chordCube}
                chordNames={[
                    ChordNames.maj7Chord,
                    ChordNames.min7Chord,
                    ChordNames.domChord,
                    ChordNames.min7b5Chord,
                    ChordNames.minMajChord,
                    ChordNames.majAugChord,
                    ChordNames.domAugChord,
                    ChordNames.dim7Chord,
                    ChordNames.augChord,
                    // ChordNames.domb5Chord,
                    // ChordNames.domSusChord,
                    // ChordNames.majb5Chord,
                    // ChordNames.majSusChord,
                ]}
            />
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
