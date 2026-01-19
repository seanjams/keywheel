import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { AppStore } from "../../store/state";
import { useDerivedState } from "../../store/hooks";
import { KeyCube } from "./keycube";
import { ChordCube } from "./chordcube";

const Loader: React.FC = () => {
    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "24px",
            }}
        >
            Loading 3D Scene...
        </div>
    );
};

interface ThreeCanvasProps {
    appStore: AppStore;
}

// ChordCube
export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ appStore }) => {
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    const [getState] = useDerivedState(
        appStore,
        ({ keyCubeVisible, chordCubeVisible }) => ({
            keyCubeVisible,
            chordCubeVisible,
        }),
    );
    const { keyCubeVisible, chordCubeVisible } = getState();

    return (
        <>
            <div style={{ display: keyCubeVisible ? "block" : "none" }}>
                <KeyCube appStore={appStore} />
            </div>
            <div style={{ display: chordCubeVisible ? "block" : "none" }}>
                <ChordCube appStore={appStore} />
            </div>

            {!isCanvasReady && <Loader />}
            <Canvas
                style={{
                    position: "fixed",
                    top: "50px",
                    left: "0",
                    width: "100vw",
                    height: "calc(100vh - 50px)",
                    pointerEvents: "none",
                }}
                eventSource={document.getElementById("root") as HTMLElement}
                onCreated={() => {
                    console.log("Canvas ready");
                    setIsCanvasReady(true);
                }}
            >
                <View.Port />
            </Canvas>
        </>
    );
};
