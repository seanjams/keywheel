import React, { useRef } from "react";
import { View, OrthographicCamera } from "@react-three/drei";
import { AppStore } from "../../store/state";
import { Lights, Controls, ScaleVertices, Edges } from "./common";
import { SceneKey } from "../../store/types";

interface KeyCubeProps {
    appStore: AppStore;
}

// KeyCube
export const KeyCube: React.FC<KeyCubeProps> = ({ appStore }) => {
    const keyCubeDivRef = useRef<HTMLDivElement>(null);
    const { edgeSize, startingPos } = appStore.state.keyCube;
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
                    position={startingPos}
                    far={100000}
                    near={edgeSize}
                />
                <Lights />
                <Controls />
                <ScaleVertices appStore={appStore} scene={SceneKey.keyCube} />
                <Edges appStore={appStore} scene={SceneKey.keyCube} />
            </View>
        </div>
    );
};
