import React from "react";
import Tone from "tone";
import {
	keyReader,
	getPegs,
	chordReader,
	rotate,
	updateCanvas,
	getMajor,
} from "./util";

const noteRadius = 14;
const scaleRadius = 36;

class Scale extends React.Component {
	componentDidMount() {
		this.handleCanvas();
	}

	componentDidUpdate() {
		this.handleCanvas();
	}

	handleCanvas() {
		const ctx = this.refs.canvas.getContext("2d");
		const radius = 36;
		updateCanvas(ctx, radius, this.props.selectedNotes);
	}

	handleClick(pegs, modeIdx = 0) {
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

	init(i, pegs) {
		const idx = pegs.indexOf(i);
		if (idx >= 0) this.handleClick(pegs, idx);
	}

	noteComponents(notes, pegs, center, relMajor) {
		const { selectedNotes, rootReferenceEnabled } = this.props;
		const { rootIdx } = chordReader(selectedNotes);

		return notes.map((note, i) => {
			const color = i === rootIdx ? "red" : "black";
			let backgroundColor;
			let numLabel = null;

			if (selectedNotes[i]) {
				backgroundColor = "yellow";
			} else {
				backgroundColor = note ? "#AAF" : "transparent";
			}

			if (pegs.includes(i)) {
				numLabel = i === relMajor[pegs.indexOf(i)] ? "" : "b";
				numLabel += `${pegs.indexOf(i) + 1}`;
			}

			const onClick = e => {
				e.stopPropagation();
				this.init(i, pegs);
			};

			const style = {
				position: "absolute",
				width: noteRadius,
				height: noteRadius,
				borderRadius: noteRadius,
				backgroundColor: backgroundColor,
				border: `1px solid ${color}`,
				color: color,
				fontSize: "0.5em",
				textAlign: "center",
				top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
				left: center.x + scaleRadius * Math.sin(Math.PI * i / 6),
			};

			const numLabelStyle = {
				position: "relative",
				top: "0.2em",
			};

			return (
				<div key={i} onClick={onClick} style={style}>
					<span style={numLabelStyle}>
						{rootReferenceEnabled ? numLabel : i}
					</span>
				</div>
			);
		});
	}

	render() {
		const { node } = this.props;
		const { notes, center } = node;
		const { name, rootIdx } = keyReader(notes);
		const relMajor = getMajor(rootIdx);
		let pegs = getPegs(notes);

		while (pegs[0] !== rootIdx) pegs = rotate(pegs);

		const noteDivs = this.noteComponents(notes, pegs, center, relMajor);
		const label = name.split(" ").map((piece, i) => {
			return <p key={i}>{piece}</p>;
		});

		const textStyle = {
			position: "absolute",
			top: center.y - 4,
			left: center.x,
			fontSize: "12px",
			textAlign: "center",
		};

		const canvasStyle = {
			position: "absolute",
			top: center.y - scaleRadius + noteRadius / 2,
			left: center.x - scaleRadius + noteRadius / 2,
		};

		return (
			<div onClick={() => this.handleClick(pegs)}>
				{noteDivs}
				<div style={textStyle}>{label}</div>
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

export default Scale;
