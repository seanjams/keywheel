import React, { CSSProperties, useState } from "react";

import { grey, lighterGrey, lightGrey } from "../../colors";
import { AppStore } from "../../store/state";
import { ChordNames } from "../../types";
import { SceneKey } from "../../store/types";

interface ToolBarProps {
    appStore: AppStore;
    scene: SceneKey;
    chordNames: ChordNames[];
}

const buttonStyle: CSSProperties = {
    padding: "5px",
    margin: "5px",
    textAlign: "center",
    minWidth: "60px",
    height: "30px",
    fontSize: "0.8rem",
    border: 0,
    borderRadius: "3px",
};

export const ToolBar: React.FC<ToolBarProps> = ({
    appStore,
    scene,
    chordNames,
}) => {
    const defaultIsVisible: Partial<Record<ChordNames, boolean>> = {};
    chordNames.forEach((chordName) => {
        defaultIsVisible[chordName] = true;
    });
    const [isVisible, setIsVisible] =
        useState<Partial<Record<ChordNames, boolean>>>(defaultIsVisible);

    const toggleVisible = (chordName: keyof typeof isVisible) => {
        const shouldHide = isVisible[chordName] || false;
        appStore.dispatch.hideVertices(scene, chordName, shouldHide);
        setIsVisible({
            ...isVisible,
            [chordName]: !isVisible[chordName],
        });
    };

    return (
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
                    style={{
                        ...buttonStyle,
                        backgroundColor: isVisible[chordName]
                            ? lightGrey
                            : grey,
                    }}
                    onClick={() => toggleVisible(chordName)}
                >
                    {chordName}
                </button>
            ))}
        </div>
    );
};
