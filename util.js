import isEqual from "lodash/isEqual";
import Tone from "tone";
import { COLORS, CHORD_COLOR, INTERVAL_COLORS, grey } from "./colors";
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

//keywheel size control

//Scale Node class dynamically holds information about location
export class ScaleNode {
	constructor(notes = C, center = WHEEL_CENTER) {
		this.rank = 0;
		this.notes = notes;
		this.center = center;
		this.parent = null;
		this.parentCenter = null;
		this.children = [];
	}

	addChild(node) {
		node.parent = this;
		node.parentCenter = this.center;
		node.rank = this.rank + 1;
		this.children.push(node);
	}

	removeChild(node) {
		node.parent = null;
		node.parentCenter = null;
		node.rank = 0;
		this.children.splice(this.children.indexOf(node), 1);
	}
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

export const generateNeighbors = (node, visited, delta, flip) => {
	const { notes, parentCenter, center } = node;
	const parentNotes = node.parent ? node.parent.notes : null;
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
			neighbor.center = getCenter(center, DIRS[i], delta, flip);
		});
	} else {
		const deltaX = 2 * center.x - parentCenter.x;
		const deltaY = 2 * center.y - parentCenter.y;
		neighbors.forEach(neighbor => {
			if (isSameType(parentNotes, neighbor.notes)) {
				neighbor.center = { x: deltaX, y: parentCenter.y };
			} else if (neighbor.tweekStatus === parentTweekStatus) {
				neighbor.center = { x: parentCenter.x, y: deltaY };
			} else {
				neighbor.center = { x: deltaX, y: deltaY };
			}
		});
	}

	return { neighbors, adjustedPegs };
};

export const buildKeyWheel = (start, delta, flip) => {
	const queue = [start];
	const visited = [start];
	let currentNode, neighbors, newNode;

	while (visited.length < 36) {
		currentNode = queue.shift();
		if (!currentNode) return start;
		neighbors = generateNeighbors(currentNode, visited, delta, flip).neighbors;

		neighbors.forEach(neighbor => {
			if (!neighbor) return;
			newNode = new ScaleNode(neighbor.notes, neighbor.center);
			currentNode.addChild(newNode);
			queue.push(newNode);
			visited.push(newNode);
		});
	}

	return visited;
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
			let temp = [...notes];
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

export const updateCanvas = (ctx, radius, selectedNotes, colorIdx = 8) => {
	ctx.clearRect(0, 0, 2 * radius, 2 * radius);
	selectedNotes.forEach((notes, i) => {
		if (notes.length === 0) return;
		const pegs = getPegs(notes);
		if (pegs.length < 3) return;
		const start = {
			x: radius * (1 + Math.sin(Math.PI * pegs[0] / 6)),
			y: radius * (1 - Math.cos(Math.PI * pegs[0] / 6)),
		};

		if (selectedNotes.length > 1) {
			ctx.fillStyle = COLORS(0.5)[i];
		} else {
			ctx.fillStyle = COLORS(0.5)[colorIdx];
		}

		ctx.strokeStyle = grey;

		//draw chord
		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		pegs.forEach((peg, i) => {
			if (i === 0) return;
			let delta = peg - peg[i - 1];
			const newPos = {
				x: radius * (1 + Math.sin(Math.PI * peg / 6)),
				y: radius * (1 - Math.cos(Math.PI * peg / 6)),
			};
			ctx.lineTo(newPos.x, newPos.y);
		});
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	});
};

export const soundNotes = (pegs, modeIdx = 0, poly = false) => {
	Tone.Transport.cancel(0);

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

	let scale = [...pegs];
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

//helper methods
//////////////////////////////////////////////////////////////////

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
		peg = (peg % 12 + 12) % 12;
		notes[peg] = true;
	});

	return notes;
};

export const mergeNotes = notesArr => {
	const result = [...EMPTY];
	notesArr.forEach(notes => {
		notes.forEach((note, i) => {
			if (note) result[i] = true;
		});
	});
	return result;
};

export const isSameType = (notes1, notes2) => {
	let temp = [...notes2];
	for (let i = 0; i < notes2.length; i++) {
		if (isEqual(notes1, temp)) {
			return true;
		} else {
			temp = rotate(temp);
		}
	}

	return false;
};

export const rotate = arr => {
	const rotated = [];
	for (let i = 0; i < arr.length; i++) {
		if (i === arr.length - 1) {
			rotated.push(arr[0]);
		} else {
			rotated.push(arr[i + 1]);
		}
	}

	return rotated;
};

export const getCenter = (
	center,
	parentDirection,
	d = SCALE_SPACING,
	flip = false
) => {
	flip = flip ? -1 : 1;
	const deltas = {
		TL: { x: center.x + d, y: center.y + d * flip },
		BL: { x: center.x + d, y: center.y - d * flip },
		TR: { x: center.x - d, y: center.y + d * flip },
		BR: { x: center.x - d, y: center.y - d * flip },
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
	[...EMPTY],
	[...EMPTY],
	[...EMPTY],
	[...EMPTY],
	[...EMPTY],
	[...EMPTY],
	[...EMPTY],
	[...EMPTY],
];
