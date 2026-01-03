import isEqual from "lodash/isEqual";
import * as Tone from "tone";
import { COLORS, CHORD_COLOR, offWhite, mediumGrey, lightGrey } from "./colors";
import { DIRS, C, EMPTY, NOTE_NAMES, MAJOR, SHAPES } from "./consts";
import { ChordNames, Dirs, NoteNames, TweekType } from "./types";

export const DEFAULT_NOTE_COLOR_OPTIONS = () => EMPTY.map(() => [lightGrey]);

export class ScaleNode {
    rank: number;
    notes: boolean[];
    center: { x: number; y: number };
    parent: ScaleNode | null;

    constructor(notes = C, center = { x: 0, y: 0 }) {
        this.rank = 0;
        this.notes = notes;
        this.center = center;
        this.parent = null;
        // this.children = [];
    }

    addChild(node: ScaleNode) {
        node.parent = this;
        node.rank = this.rank + 1;
        // this.children.push(node);
    }

    removeChild(node: ScaleNode) {
        node.parent = null;
        node.rank = 0;
        // this.children.splice(this.children.indexOf(node), 1);
    }
}

export function nodeFromRoot(root: number): ScaleNode {
    return new ScaleNode(getNotes(getMajor(root)));
}

export const tweek = (notes: boolean[], idx: number) => {
    const pegs = getPegs(notes);
    let temp = pegs[idx];
    let tweekStatus = 0;

    if (idx === 0) {
        pegs[idx] = pegs[1] - pegs[0] + pegs[6] - 12;
    } else if (idx === pegs.length - 1) {
        pegs[idx] = 12 + pegs[0] - pegs[6] + pegs[5];
    } else {
        pegs[idx] = pegs[idx + 1] - pegs[idx] + pegs[idx - 1];
    }

    if (temp > pegs[idx]) {
        tweekStatus--;
    } else if (temp < pegs[idx]) {
        tweekStatus++;
    }

    return { notes: getNotes(pegs), tweekStatus };
};

export function generateNeighbors(
    node: ScaleNode,
    visited: ScaleNode[],
    flip: 1 | -1,
) {
    const { notes, parent, center } = node;
    const parentNotes = parent ? parent.notes : null;
    const adjustedPegs: number[] = [];
    let neighbors: TweekType[] = [];
    let parentTweekStatus: number;
    let temp: TweekType;

    // Checks if tweek changes the key, then checks to see if
    // changed key is either parent or other visited neighbor,
    // then collects the neighbor and which peg was adjusted if so

    for (var i = 0; i < 7; i++) {
        temp = tweek(notes, i);
        if (isEqual(notes, temp.notes)) continue;
        if (isEqual(parentNotes, temp.notes)) {
            parentTweekStatus = temp.tweekStatus;
        } else if (!includesKey(visited, temp.notes)) {
            neighbors.push(temp);
        }
        adjustedPegs.push(i + 1);
    }

    //If no parentNotes, we are starting the keywheel.
    //Generate the neighbors so that top and bottom neighbor pairs are same type.
    //If parentNotes, use tweekStatus and isSameType to calculate centers

    if (!parent) {
        while (!isSameType(neighbors[0].notes, neighbors[1].notes)) {
            neighbors = rotate(neighbors);
        }
        neighbors.forEach((neighbor, i) => {
            neighbor.center = getCenter(center, DIRS[i], flip);
        });
    } else {
        const deltaX = 2 * center.x - parent.center.x;
        const deltaY = 2 * center.y - parent.center.y;
        neighbors.forEach((neighbor) => {
            if (parentNotes && isSameType(parentNotes, neighbor.notes)) {
                neighbor.center = { x: deltaX, y: parent.center.y };
            } else if (neighbor.tweekStatus === parentTweekStatus) {
                neighbor.center = { x: parent.center.x, y: deltaY };
            } else {
                neighbor.center = { x: deltaX, y: deltaY };
            }
        });
    }

    return { neighbors, adjustedPegs };
}

export const buildKeyWheel: (start: number) => ScaleNode[] = (
    start: number,
) => {
    const flip = start > 6 ? -1 : 1;
    const startNode = nodeFromRoot(start);
    const queue = [startNode];
    const visited = [startNode];
    let currentNode: ScaleNode;
    let neighbors: TweekType[];
    let newNode: ScaleNode;

    while (visited.length < 36) {
        const node = queue.shift();
        if (!node) return [startNode];
        currentNode = node;
        neighbors = generateNeighbors(currentNode, visited, flip).neighbors;

        neighbors.forEach((neighbor) => {
            if (!neighbor) return;
            newNode = new ScaleNode(neighbor.notes, neighbor.center);
            currentNode.addChild(newNode);
            queue.push(newNode);
            visited.push(newNode);
        });
    }

    return visited.sort((a, b) => {
        return a.center.y === b.center.y
            ? a.center.x - b.center.x
            : a.center.y - b.center.y;
    });
};

//returns chord color, name, and rootIdx from dictionary
export function chordReader(notes: boolean[]): {
    color: string;
    name: string;
    rootIdx: number;
} {
    const chords = Object.keys(SHAPES) as ChordNames[];
    let color = "transparent";
    let rootIdx = 0;
    let name = "";
    let chordShape;

    for (let i = 0; i < chords.length; i++) {
        chordShape = getNotes(SHAPES[chords[i]]);
        if (isSameType(notes, chordShape)) {
            let temp = dup(notes);
            while (!isEqual(temp, chordShape)) {
                temp = rotate(temp);
                rootIdx += 1;
            }
            color = CHORD_COLOR[chords[i]];
            name = `${NOTE_NAMES[rootIdx]} ${chords[i]}`;
            break;
        } // else if here to add dynamic chord inclusion
    }

    if (color === "transparent") {
        rootIdx = -1;
        name = "";
    }

    return { color, name, rootIdx };
}

// get notes array from root + shape
export function getNotesFromName(
    root: NoteNames,
    scaleType: ChordNames,
): boolean[] | null {
    if (!SHAPES.hasOwnProperty(scaleType)) return null;
    if (!NOTE_NAMES.includes(root)) return null;
    const rootIdx = NOTE_NAMES.indexOf(root);
    return getNotes(SHAPES[scaleType].map((peg) => mod(rootIdx + peg, 12)));
}

let currentSequence: Tone.Sequence | null = null;
let currentSynth: Tone.PolySynth | null = null;

export const soundNotes = async (pegs: number[], modeIdx = 0, poly = false) => {
    await Tone.start();

    const transport = Tone.getTransport();

    // Cleanup previous playback
    if (currentSequence) {
        currentSequence.stop();
        currentSequence.dispose();
        currentSequence = null;
    }
    if (currentSynth) {
        currentSynth.dispose();
        currentSynth = null;
    }

    transport.stop();
    transport.cancel(0);
    transport.position = 0;

    currentSynth = new Tone.PolySynth(Tone.Synth).toDestination();

    let scale = dup(pegs);
    for (let i = 0; i < modeIdx; i++) scale = rotate(scale);

    const notes: string[] = [];
    for (let i = 0; i < scale.length; i++) {
        if (scale[i + 1] < scale[i]) scale[i + 1] += 12;
        notes.push(Tone.Frequency(60 + scale[i], "midi").toNote());
    }
    if (!poly) notes.push(Tone.Frequency(notes[0]).transpose(12).toNote());

    if (poly) {
        currentSynth.triggerAttackRelease(notes, "4n", Tone.now(), 0.5);
    } else {
        currentSequence = new Tone.Sequence(
            (time, note) => {
                currentSynth?.triggerAttackRelease(note, "8n", time, 0.5);
            },
            notes,
            "8n",
        );

        currentSequence.loop = false;
        currentSequence.start(0);
        transport.start();
    }
};

//input: [0,2,2,1] relative tablature for Major chord
//output: [1,3,4,2] corresponding finger to play each note with
//(1 = index, 2 = middle, 3 = ring, 4 = pinky)
export function chordFingerMachine(tabArr: number[]): number[] {
    let done = false;
    const fingers = tabArr.map((_, i) => i);
    while (!done) {
        done = true;
        for (let i = 0; i < tabArr.length - 1; i++) {
            let first = fingers.indexOf(i);
            let second = fingers.indexOf(i + 1);
            if (tabArr[first] > tabArr[second]) {
                fingers[first] = i + 1;
                fingers[second] = i;
                done = false;
                break;
            }
        }
    }
    return fingers;
}

//helper methods
//////////////////////////////////////////////////////////////////

export function dup<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function includesKey(nodes: ScaleNode[], notes: boolean[]): boolean {
    const notesArr = nodes.map((node) => node.notes);
    for (let i = 0; i < notesArr.length; i++) {
        if (isEqual(notesArr[i], notes)) return true;
    }

    return false;
}

export function getPegs(notes: boolean[]): number[] {
    const pegs: number[] = [];
    notes.forEach((note, i) => {
        if (note) pegs.push(i);
    });

    return pegs;
}

export function getNotes(pegs: number[]): boolean[] {
    const notes = Array(...EMPTY);
    pegs.forEach((peg) => {
        peg = mod(peg, 12);
        notes[peg] = true;
    });

    return notes;
}

export function mergeNotes(notesArr: boolean[][]): boolean[] {
    const result = [...EMPTY];
    notesArr.forEach((notes) => {
        notes.forEach((note, i) => {
            if (note) result[i] = true;
        });
    });

    return result;
}

export function isSameType(notes1: boolean[], notes2: boolean[]): boolean {
    let temp = dup(notes2);
    for (let i = 0; i < notes2.length; i++) {
        if (isEqual(notes1, temp)) {
            return true;
        } else {
            temp = rotate(temp);
        }
    }

    return false;
}

export function rotate<T>(arr: Array<T>, times: number = 1): Array<T> {
    let rotated = dup(arr);
    for (let i = 0; i < times; i++) {
        rotated = rotated.slice(1).concat(rotated[0]);
    }

    return rotated;
}

export function getCenter(
    center: { x: number; y: number },
    parentDirection: Dirs,
    dy: number,
): { x: number; y: number } {
    const deltas = {
        TL: { x: center.x + 1, y: center.y + dy },
        BL: { x: center.x + 1, y: center.y - dy },
        TR: { x: center.x - 1, y: center.y + dy },
        BR: { x: center.x - 1, y: center.y - dy },
    };

    return deltas[parentDirection];
}

export function getIntervals(pegs: number[]): number[] {
    const intervals: number[] = [];
    for (let i = 0; i < pegs.length; i++) {
        if (i === pegs.length - 1) {
            intervals.push(12 + pegs[0] - pegs[i]);
        } else {
            intervals.push(pegs[i + 1] - pegs[i]);
        }
    }

    return intervals;
}

export function getMajor(rootIdx: number): number[] {
    if (!(0 <= rootIdx && rootIdx <= 11)) return [];
    let temp = rootIdx;
    const pegs = [temp];
    for (let i = 0; i + 1 < MAJOR.length; i++) {
        temp += MAJOR[i];
        pegs.push(temp % 12);
    }

    return pegs;
}

export function getEmptySet(): boolean[][] {
    return [
        dup(EMPTY),
        dup(EMPTY),
        dup(EMPTY),
        dup(EMPTY),
        dup(EMPTY),
        dup(EMPTY),
        dup(EMPTY),
        dup(EMPTY),
    ];
}

export function mod(a: number, m: number): number {
    return ((a % m) + m) % m;
}

export function bStringStep(a: number, b: number): number {
    if (a < 2 && b >= 2) return -1;
    if (b < 2 && a >= 2) return 1;
    return 0;
}

export function inRange(point: [number, number]): boolean {
    return (
        point &&
        point[0] >= 0 &&
        point[0] <= 5 &&
        point[1] >= 0 &&
        point[1] <= 16
    );
}

export function getOctaveFrets(point: [number, number]): [number, number][][] {
    let activeString = point[0];
    let delta, step;
    let activeFret = activeString < 2 ? point[1] - 1 : point[1];

    const result = [[dup(point)]];
    for (let i = 0; i < 6; i++) {
        if (i === activeString) continue;
        delta = activeString - i;
        let j = mod(activeFret - delta * 5, 12);
        if (i < 2) j += 1;
        result.push([[i, j]]);
        if (j + 12 < 16) result.push([[i, j + 12]]);
    }

    return result;
}

export function getLabelColors(
    notesArr: boolean[][],
    isPiano: boolean,
): { [key in string]: { background: string; color: string } } {
    const selectedNotesByInput: { [key in string]: number[] } = {};
    const result: { [key in string]: { background: string; color: string } } =
        {};
    NOTE_NAMES.forEach((name) => {
        selectedNotesByInput[name] = [];
    });

    notesArr.forEach((notes, i) => {
        notes.forEach((note, j) => {
            if (note) selectedNotesByInput[NOTE_NAMES[j]].push(i);
        });
    });

    NOTE_NAMES.forEach((name) => {
        const colors = selectedNotesByInput[name].map((i) => COLORS(1)[i]);
        const flat = name.length > 1;

        if (colors.length > 1) {
            const stripes: string[] = [];
            for (let i = 0; i < colors.length; i++) {
                stripes.push(`${colors[i]} ${(100 * i) / colors.length}%`);
                if (colors[i + 1])
                    stripes.push(
                        `${colors[i]} ${(100 * (i + 1)) / colors.length}%`,
                    );
            }

            result[name] = {
                background: `linear-gradient(45deg, ${stripes})`,
                color: offWhite,
            };
        } else if (colors.length === 1) {
            result[name] = {
                background: colors[0],
                color: offWhite,
            };
        } else {
            result[name] = {
                background: isPiano ? (flat ? "black" : "white") : "#ddd",
                color: mediumGrey,
            };
        }
    });

    return result;
}

// Save to Clipboard helpers
export function fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand("copy");
        const msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
    } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
}

export function onCopyToClipboard(text: string): void {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }

    navigator.clipboard.writeText(text).then(
        () => console.log("Copying to clipboard was successful!"),
        (err) => console.error("Could not copy text: ", err),
    );
}
