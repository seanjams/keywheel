import React from "react";
import Tone from "tone";
import {
	NOTE_NAMES,
	EMPTY,
	getPegs,
	chordReader,
	updateCanvas,
	rotate,
} from "./util";

const noteRadius = 30;
const scaleRadius = 80;
const center = { x: 120, y: 300 };

const textStyle = {
	position: "absolute",
	top: center.y,
	left: center.x - 22,
	width: "80px",
	textAlign: "center",
};

const canvasStyle = {
	position: "absolute",
	top: center.y - scaleRadius + noteRadius / 2,
	left: center.x - scaleRadius + noteRadius / 2,
};

const buttonStyle = (x, y) => ({
	position: "absolute",
	top: center.y - y,
	left: center.x - x,
	border: "1px solid black",
	borderRadius: "10px",
	padding: "10px",
});

const soundStyle = buttonStyle(50, 200);
const refStyle = buttonStyle(50, 140);

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			notes: [...EMPTY],
		};
	}

	toggleNote(i) {
		const notes = [...this.state.notes];
		notes[i] = !notes[i];
		this.props.handleClick(i);
		this.setState({ notes });
	}

	componentDidMount() {
		this.handleCanvas();
	}

	componentDidUpdate() {
		this.handleCanvas();
	}

	handleCanvas() {
		const ctx = this.refs.canvas.getContext("2d");
		const radius = 80;
		updateCanvas(ctx, radius, this.state.notes);
	}

	handleClick(pegs) {
		if (pegs.length === 0) return;
		Tone.Transport.cancel();

		let synth = new Tone.Synth().toMaster();
		let scale = [...pegs];
		const freqs = [];

		for (let i = 0; i < scale.length; i++) {
			if (scale[i + 1] < scale[i]) scale[i + 1] += 12;
			freqs.push(Tone.Frequency().midiToFrequency(60 + scale[i]));
		}

		const pattern = new Tone.Sequence(
			(time, note) => synth.triggerAttackRelease(note, "8n", time),
			freqs,
			"8n"
		).start();

		pattern.loop = 0;
		Tone.Transport.start();
	}

	noteComponents(notes, rootIdx) {
		return notes.map((note, i) => {
			const color = i === rootIdx ? "red" : "black";
			const backgroundColor = note ? "yellow" : "transparent";

			const style = {
				position: "absolute",
				width: noteRadius,
				height: noteRadius,
				borderRadius: noteRadius,
				backgroundColor,
				border: `1px solid ${color}`,
				color,
				textAlign: "center",
				top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
				left: center.x + scaleRadius * Math.sin(Math.PI * i / 6),
			};

			return (
				<div
					key={i}
					onClick={() => this.toggleNote(i)}
					className="input-note"
					style={style}
				>
					<span
						style={{
							position: "relative",
							top: "0.4em",
						}}
					>
						{this.props.rootReferenceEnabled ? NOTE_NAMES[i] : i}
					</span>
				</div>
			);
		});
	}

	render() {
		const { notes } = this.state;
		const { name, rootIdx } = chordReader(notes);
		let pegs = getPegs(notes);

		if (rootIdx > -1) {
			while (pegs[0] !== rootIdx) pegs = rotate(pegs);
		}

		const noteDivs = this.noteComponents(notes, rootIdx);

		return (
			<div>
				<button onClick={() => this.handleClick(pegs)} style={soundStyle}>
					Sound Notes
				</button>
				<button onClick={this.props.toggleRef} style={refStyle}>
					Reference Root
				</button>
				{noteDivs}
				<div style={textStyle}>
					<span>
						{name.split(" ").map((piece, i) => {
							return <p key={i}>{piece}</p>;
						})}
					</span>
				</div>
				<canvas
					ref="canvas"
					width={2 * scaleRadius}
					height={2 * scaleRadius}
					style={canvasStyle}
				/>
			</div>
		);
	}
}

export default Input;
