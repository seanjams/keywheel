import isEqual from "lodash/isEqual";
import Tone from "tone";
import { COLORS, CHORD_COLOR, INTERVAL_COLORS, grey, offWhite } from "./colors";
import {
	SCALE_SPACING,
	WHEEL_CENTER,
	DIRS,
	C,
	EMPTY,
	NOTE_NAMES,
	MAJOR,
	MELMINOR,
	NEAPOLITAN,
	SHAPES,
} from "./consts";

export class ScaleNode {
	constructor(notes = C, center = { x: 0, y: 0 }) {
		this.rank = 0;
		this.notes = notes;
		this.center = center;
		this.parent = null;
		// this.children = [];
	}

	addChild(node) {
		node.parent = this;
		node.rank = this.rank + 1;
		// this.children.push(node);
	}

	removeChild(node) {
		node.parent = null;
		node.rank = 0;
		// this.children.splice(this.children.indexOf(node), 1);
	}
}

export const nodeFromRoot = root => {
	return new ScaleNode(getNotes(getMajor(root)));
}

export const tweek = (notes, idx) => {
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

export const generateNeighbors = (node, visited, flip) => {
	const { notes, parent, center } = node;
	const parentNotes = parent ? parent.notes : null;
	const adjustedPegs = [];
	let neighbors = [];
	let parentTweekStatus;
	let temp;

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

	if (!parentNotes) {
		while (!isSameType(neighbors[0].notes, neighbors[1].notes)) {
			neighbors = rotate(neighbors);
		}
		neighbors.forEach((neighbor, i) => {
			neighbor.center = getCenter(center, DIRS[i], flip);
		});
	} else {
		const deltaX = 2 * center.x - parent.center.x;
		const deltaY = 2 * center.y - parent.center.y;
		neighbors.forEach(neighbor => {
			if (isSameType(parentNotes, neighbor.notes)) {
				neighbor.center = { x: deltaX, y: parent.center.y };
			} else if (neighbor.tweekStatus === parentTweekStatus) {
				neighbor.center = { x: parent.center.x, y: deltaY };
			} else {
				neighbor.center = { x: deltaX, y: deltaY };
			}
		});
	}

	return { neighbors, adjustedPegs };
};

export const buildKeyWheel = (start, flip = 1) => {
	const queue = [start];
	const visited = [start];
	let currentNode, neighbors, newNode;

	while (visited.length < 36) {
		currentNode = queue.shift();
		if (!currentNode) return start;
		neighbors = generateNeighbors(currentNode, visited, flip).neighbors;

		neighbors.forEach(neighbor => {
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
export const chordReader = notes => {
	const chords = Object.keys(SHAPES);
	let color = "transparent";
	let rootIdx = 0;
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
};

export const soundNotes = (pegs, modeIdx = 0, poly = false) => {
	Tone.Transport.cancel(0);
	if (Tone.context.state !== "running") Tone.context.resume();
	let synth = new Tone.PolySynth(pegs.length).toMaster();
	// synth.set({
	// 	oscillator: {
	// 		type: "amtriangle",
	// 	},
	// 	// filter: {
	// 	// 	Q: 6,
	// 	// 	type: "lowpass",
	// 	// 	rolloff: -24,
	// 	// },
	// 	envelope: {
	// 		attack: 0.1,
	// 		decay: 0.2,
	// 		sustain: 1,
	// 		release: 0.8,
	// 	},
	// 	// filterEnvelope: {
	// 	// 	attack: 0.06,
	// 	// 	decay: 0.2,
	// 	// 	sustain: 0.5,
	// 	// 	release: 2,
	// 	// 	baseFrequency: 200,
	// 	// 	octaves: 7,
	// 	// 	exponent: 2,
	// 	// },
	// });

	let scale = dup(pegs);
	for (let i = 0; i < modeIdx; i++) scale = rotate(scale);

	const freqs = [];
	for (let i = 0; i < scale.length; i++) {
		if (scale[i + 1] < scale[i]) scale[i + 1] += 12;
		freqs.push(Tone.Frequency().midiToFrequency(60 + scale[i]));
	}
	if (!poly) freqs.push(freqs[0] * 2);
	let pattern;

	if (poly) {
		pattern = new Tone.Event((time, chord) => {
			synth.triggerAttackRelease(chord, "4t", time, 0.3);
		}, freqs);
	} else {
		pattern = new Tone.Sequence(
			(time, note) => {
				synth.triggerAttackRelease(note, "8n", time, 0.3);
			},
			freqs,
			"8n"
		);
	}

	pattern.loop = 0;
	pattern.start();
	Tone.Transport.start();
};

//input: [0,2,2,1] relative tablature for Major chord
//output: [1,3,4,2] corresponding finger to play each note with
//(1 = index, 2 = middle, 3 = ring, 4 = pinky)
export const chordFingerMachine = tabArr => {
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
};

//helper methods
//////////////////////////////////////////////////////////////////

export const dup = obj => {
	return JSON.parse(JSON.stringify(obj));
};

export const includesKey = (nodes, notes) => {
	const notesArr = nodes.map(node => node.notes);
	for (let i = 0; i < notesArr.length; i++) {
		if (isEqual(notesArr[i], notes)) return true;
	}

	return false;
};

export const getPegs = notes => {
	const pegs = [];
	notes.forEach((note, i) => {
		if (note) pegs.push(i);
	});

	return pegs;
};

export const getNotes = pegs => {
	const notes = Array(...EMPTY);
	pegs.forEach(peg => {
		peg = mod(peg, 12);
		notes[peg] = true;
	});

	return notes;
};

export const mergeNotes = notesArr => {
	const result = dup(EMPTY);
	notesArr.forEach(notes => {
		notes.forEach((note, i) => {
			if (note) result[i] = true;
		});
	});

	return result;
};

export const isSameType = (notes1, notes2) => {
	let temp = dup(notes2);
	for (let i = 0; i < notes2.length; i++) {
		if (isEqual(notes1, temp)) {
			return true;
		} else {
			temp = rotate(temp);
		}
	}

	return false;
};

export const rotate = (arr, times = 1) => {
	let rotated = dup(arr);
	for (let i = 0; i < times; i++) {
		rotated = rotated.slice(1).concat(rotated[0]);
	}

	return rotated;
};

export const getCenter = (center, parentDirection, dy) => {
	const deltas = {
		TL: { x: center.x + 1, y: center.y + dy },
		BL: { x: center.x + 1, y: center.y - dy },
		TR: { x: center.x - 1, y: center.y + dy },
		BR: { x: center.x - 1, y: center.y - dy },
	};

	return deltas[parentDirection];
};

export const getIntervals = pegs => {
	const intervals = [];
	for (let i = 0; i < pegs.length; i++) {
		if (i === pegs.length - 1) {
			intervals.push(12 + pegs[0] - pegs[i]);
		} else {
			intervals.push(pegs[i + 1] - pegs[i]);
		}
	}

	return intervals;
};

export const getMajor = rootIdx => {
	if (!(0 <= rootIdx <= 11)) return;
	let temp = rootIdx;
	const pegs = [temp];
	for (let i = 0; i + 1 < MAJOR.length; i++) {
		temp += MAJOR[i];
		pegs.push(temp % 12);
	}

	return pegs;
};

export const getEmptySet = () => [
	dup(EMPTY),
	dup(EMPTY),
	dup(EMPTY),
	dup(EMPTY),
	dup(EMPTY),
	dup(EMPTY),
	dup(EMPTY),
	dup(EMPTY),
];

export const mod = (a, m) => {
	return ((a % m) + m) % m;
};

export const bStringStep = (a, b) => {
	if (a < 2 && b >= 2) return -1;
	if (b < 2 && a >= 2) return 1;
	return 0;
};

export const inRange = point => {
	return (
		point && point[0] >= 0 && point[0] <= 5 && point[1] >= 0 && point[1] <= 16
	);
};

export const getOctaveFrets = point => {
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
};

export const getLabelColors = (notesArr, isPiano) => {
	const selectedNotesByInput = {};
	const result = {};
	NOTE_NAMES.forEach(name => {
		selectedNotesByInput[name] = [];
	});

	notesArr.forEach((notes, i) => {
		notes.forEach((note, j) => {
			if (note) selectedNotesByInput[NOTE_NAMES[j]].push(i);
		});
	});

	NOTE_NAMES.forEach(name => {
		const colors = selectedNotesByInput[name].map(i => COLORS(1)[i]);
		const flat = name.endsWith("b");

		if (colors.length > 1) {
			const stripes = [];
			for (let i = 0; i < colors.length; i++) {
				stripes.push(`${colors[i]} ${(100 * i) / colors.length}%`);
				if (colors[i + 1])
					stripes.push(`${colors[i]} ${(100 * (i + 1)) / colors.length}%`);
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
				color: "#666",
			};
		}
	});

	return result;
};


// Save to Clipboard helpers
export const fallbackCopyTextToClipboard = text => {
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
};

export const onCopyToClipboard = text => {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}

	navigator.clipboard.writeText(text).then(
		() => console.log("Copying to clipboard was successful!"),
		err => console.error("Could not copy text: ", err),
	);
};
