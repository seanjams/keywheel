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
	chordReader,
	rotate,
	updateCanvas,
	getMajor,
} from "./util";

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

	collectNotes() {
		const result = [...EMPTY];
		Object.values(this.props.selected).forEach(notes => {
			notes.forEach((note, i) => {
				if (note) result[i] = true;
			});
		});
		return result;
	}

	handleCanvas() {
		const ctx = this.refs.canvas.getContext("2d");
		const radius = this.scaleRadius;
		const { node, selected, mode, colorIdx } = this.props;
		const { notes } = node;
		let selectedNotes;

		if (mode === "all") {
			const notes = this.collectNotes(selected);
			const pegs = getPegs(notes);
			const isMatch = pegs.every(i => notes[i]);
			selectedNotes = isMatch ? [notes] : [];
		} else if (mode === "each") {
			selectedNotes = [];
			selected.forEach((arr, i) => {
				const pegs = getPegs(arr);
				const isMatch = pegs.every(i => notes[i]);
				if (isMatch) {
					selectedNotes.push(arr);
				} else {
					selectedNotes.push(null);
				}
			});
		}

		updateCanvas(ctx, radius, selectedNotes || selected, colorIdx);
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
		const { selected, rootReferenceEnabled, isInput, colorIdx } = this.props;

		return notes.map((note, i) => {
			let color = "#333";
			let borderColor = "#333";
			let backgroundColor;
			let noteColor;
			let numLabel = null;

			const isMatch = selected.some((arr, idx) => {
				const arrPegs = getPegs(arr);
				let match = arr[i] && arrPegs.every(j => notes[j]);

				if (match) {
					noteColor = noteColor || COLORS(1)[idx];
				}
				return match;
			});

			if (isInput && selected[0][i]) {
				backgroundColor = COLORS(1)[colorIdx];
				color = "#EEE";
			} else if (isMatch) {
				backgroundColor = noteColor || "#7D7"; //should never happen
				color = "#EEE";
			} else {
				backgroundColor = note ? "#AAA" : "transparent";
			}

			if (this.props.isInput) {
				if (i === rootIdx) {
					color = "gold";
					borderColor = "brown";
				}
				numLabel = NOTE_NAMES[i];
			} else {
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
		const { node, selected } = this.props;
		const { notes, center } = node;
		const { name: keyName, rootIdx: keyRootIdx } = keyReader(notes);
		const { name: chordName, rootIdx: chordRootIdx } = chordReader(selected[0]);
		const relMajor = getMajor(keyRootIdx);
		let pegs = getPegs(notes);
		let label;

		while (pegs[0] !== keyRootIdx) pegs = rotate(pegs);

		if (this.props.isInput) {
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
