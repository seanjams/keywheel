import { ChordNames } from "./types";

export const darkGrey = "#333";

export const mediumGrey = "#666";

export const grey = "#999";

export const lightGrey = "#BBB";

export const lighterGrey = "#EEE";

export const offWhite = "#FEFEFE";

export const white = "#FFF";

export const buttonBlue = "rgba(100,100,255,0.5)";

export const gold = "gold";

export const brown = "brown";

export const transparent = "transparent";

export const red = "#FF0000";

export const yellow = "#FFFF00";

export const DEFAULT_TEXT_COLOR = darkGrey;

export const COLORS = (opacity: number) => [
    `rgba(230, 25, 75, ${opacity})`,
    `rgba(60, 180, 75,${opacity})`,
    `rgba(0, 130, 200,${opacity})`,
    `rgba(245, 130, 48,${opacity})`,
    `rgba(145, 30, 180,${opacity})`,
    `rgba(128, 0, 0,${opacity})`,
    `rgba(0, 0, 128,${opacity})`,
    `rgba(0, 128, 128,${opacity})`,
    `rgba(255, 225, 25,${opacity})`,
];

export const INTERVAL_COLORS = [
    `rgba(50,50,255,1)`,
    `rgba(255,0,155,1)`,
    `rgba(255,100,0,1)`,
    `rgba(0,155,0,1)`,
    `rgba(155,0,255,1)`,
    `rgba(255,155,0,1)`,
];

export const CHORD_COLOR: { [key in ChordNames]: string } = {
    [ChordNames.majorChord]: "rgba(100,100,255,0.5)",
    [ChordNames.maj7Chord]: "rgba(155,0,255,0.5)",
    [ChordNames.minorChord]: "rgba(255,100,100,0.5)",
    [ChordNames.min7Chord]: "rgba(255,0,155,0.5)",
    [ChordNames.domChord]: "rgba(255,100,0,0.5)",
    [ChordNames.augChord]: "rgba(255,0,255,0.5)",
    [ChordNames.dimChord]: "rgba(100,255,100,0.5)",
    [ChordNames.dim7Chord]: "rgba(0,155,0,0.5)",
    [ChordNames.min7b5Chord]: "rgba(0,255,0,0.5)",
    [ChordNames.minMajChord]: "rgba(0, 191, 255, 0.5)",
    [ChordNames.majAugChord]: "rgba(166, 0, 255, 0.5)",
    [ChordNames.domb5Chord]: "rgba(255, 0, 230, 0.5)",
    [ChordNames.domAugChord]: "rgba(255, 170, 0, 0.5)",
    [ChordNames.susChord]: "rgba(255,255,0,0.5)",
    [ChordNames.pentaScale]: "rgba(255,0,0,0.5)",
    [ChordNames.dimPentaScale]: "rgba(0,200,0,0.5)",
    [ChordNames.majorScale]: "rgba(0,100,255,0.5)",
    [ChordNames.melMinScale]: "rgba(0,200,255,0.5)",
    [ChordNames.NeoScale]: "rgba(155,100,255,0.5)",
    [ChordNames.harMajScale]: "rgba(255,155,0,0.5)",
    [ChordNames.harMinScale]: "rgba(76, 35, 8, 0.5)",
};
