import React from "react";
import Tone from "tone";
import {
	NOTE_RADIUS,
	SCALE_RADIUS,
	INPUT_NOTE_RADIUS,
	INPUT_SCALE_RADIUS,
	NOTE_NAMES,
	EMPTY,
	COLORS,
	keyReader,
	getPegs,
	collectNotes,
	chordReader,
	rotate,
	updateCanvas,
	getMajor,
} from "./util";

import { darkGrey, grey, offWhite, gold, brown, transparent } from "./colors";

class Scale extends React.Component {
	constructor(props) {
		super(props);
		this.scaleRadius = this.props.isInput ? INPUT_SCALE_RADIUS : SCALE_RADIUS;
		this.noteRadius = this.props.isInput ? INPUT_NOTE_RADIUS : NOTE_RADIUS;
	}

	componentDidMount() {
		this.handleCanvas();
	}

	componentDidUpdate() {
		this.handleCanvas();
	}

	handleCanvas() {
		const ctx = this.refs.canvas.getContext("2d");
		const radius = this.scaleRadius;
		const { notes, selected, mode, index, isInput } = this.props;
		let result;
		let colorIdx;

		if (isInput) {
			result = index ? [selected[index]] : [];
			colorIdx = index || 8;
		} else if (mode === "intersection") {
			const collected = collectNotes(selected);
			const pegs = getPegs(collected);
			const isMatch = pegs.every(i => notes[i]);
			colorIdx = 8;

			if (isMatch && pegs.length > 0) {
				result = [collected];
			} else {
				result = [];
			}
		} else if (mode === "union") {
			result = [];
			colorIdx = null;

			selected.forEach((arr, i) => {
				const pegs = getPegs(arr);
				const isMatch = pegs.every(i => notes[i]);
				if (isMatch && pegs.length > 0) {
					result.push(arr);
				} else {
					result.push([]);
				}
			});
		}

		updateCanvas(ctx, radius, result, colorIdx);
	}

	soundScale(pegs, modeIdx = 0) {
		Tone.Transport.cancel(0);

		let synth = new Tone.Synth().toMaster();
		let scale = [...pegs];
		for (let i = 0; i < modeIdx; i++) scale = rotate(scale);

		const freqs = [];
		for (let i = 0; i < scale.length; i++) {
			if (scale[i + 1] < scale[i]) scale[i + 1] += 12;
			freqs.push(Tone.Frequency().midiToFrequency(60 + scale[i]));
		}
		freqs.push(freqs[0] * 2);

		const pattern = new Tone.Sequence(
			(time, note) => {
				synth.triggerAttackRelease(note, "8n", time);
			},
			freqs,
			"8n"
		).start();

		pattern.loop = 0;
		Tone.Transport.start();
	}

	handleClick(i, pegs) {
		if (this.props.handleClick) {
			this.props.handleClick(i);
		} else {
			const idx = pegs.indexOf(i);
			if (idx >= 0) this.soundScale(pegs, idx);
		}
	}

	noteComponents(notes, pegs, center, relMajor, rootIdx = null) {
		const { selected, rootReferenceEnabled, isInput, index } = this.props;

		return notes.map((note, i) => {
			let color = darkGrey;
			let borderColor = darkGrey;
			let backgroundColor = transparent;
			let noteColor;
			let numLabel = null;

			const isMatch = () =>
				selected.some((arr, j) => {
					const arrPegs = getPegs(arr);
					let match =
						arr[i] && arrPegs.length > 0 && arrPegs.every(k => notes[k]);

					if (match) {
						noteColor = noteColor || COLORS(1)[j];
					}
					return match;
				});

			if (isInput) {
				if (selected[index][i]) {
					backgroundColor = COLORS(1)[index];
					if (rootIdx && i === rootIdx) {
						color = gold;
						borderColor = brown;
					} else {
						color = offWhite;
					}
				}

				numLabel = NOTE_NAMES[i];
			} else {
				if (isMatch()) {
					backgroundColor = noteColor; //should never happen
					color = offWhite;
				} else if (note) {
					backgroundColor = grey;
				}

				if (pegs.includes(i)) {
					numLabel = i === relMajor[pegs.indexOf(i)] ? "" : "b";
					numLabel += `${pegs.indexOf(i) + 1}`;
				}
			}

			const onClick = e => {
				e.stopPropagation();
				this.handleClick(i, pegs);
			};

			const style = {
				position: "absolute",
				width: this.noteRadius,
				height: this.noteRadius,
				borderRadius: this.noteRadius,
				backgroundColor,
				border: `1px solid ${borderColor}`,
				top: center.y - this.scaleRadius * Math.cos(Math.PI * i / 6),
				left: center.x + this.scaleRadius * Math.sin(Math.PI * i / 6),
			};

			const numLabelStyle = {
				color,
				fontSize: "0.5em",
				textAlign: "center",
				position: "relative",
				top: "50%",
				transform: "translateY(-50%)",
			};

			return (
				<div key={i} onClick={onClick} style={style}>
					<div style={numLabelStyle}>{rootReferenceEnabled ? numLabel : i}</div>
				</div>
			);
		});
	}

	render() {
		const { notes, center, selected, isInput, index } = this.props;
		const { name: keyName, rootIdx: keyRootIdx } = keyReader(notes);
		const { name: chordName, rootIdx: chordRootIdx } = chordReader(
			selected[index]
		);
		const relMajor = getMajor(keyRootIdx);
		let pegs = getPegs(notes);
		let label;

		while (pegs[0] !== keyRootIdx) pegs = rotate(pegs);

		if (isInput) {
			label =
				chordName &&
				chordName.split(" ").map((piece, i) => {
					return <p key={i}>{piece}</p>;
				});
		} else {
			label =
				keyName &&
				keyName.split(" ").map((piece, i) => {
					return <p key={i}>{piece}</p>;
				});
		}

		const noteDivs = this.noteComponents(
			notes,
			pegs,
			center,
			relMajor,
			chordRootIdx
		);

		const onClick = this.props.handleClick
			? () => {}
			: () => this.handleClick(pegs);

		const textStyle = {
			position: "absolute",
			top: center.y - 4,
			left: center.x,
			fontSize: "10px",
			textAlign: "center",
		};

		const canvasStyle = {
			position: "absolute",
			top: center.y - this.scaleRadius + this.noteRadius / 2,
			left: center.x - this.scaleRadius + this.noteRadius / 2,
		};

		return (
			<div onClick={onClick}>
				{noteDivs}
				<div style={textStyle}>{label}</div>
				<canvas
					ref="canvas"
					width={2 * this.scaleRadius}
					height={2 * this.scaleRadius}
					style={canvasStyle}
				/>
			</div>
		);
	}
}

export default Scale;
