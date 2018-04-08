import React from "react";
import Tone from "tone";
import {
	NOTE_RADIUS,
	SCALE_RADIUS,
	keyReader,
	getPegs,
	chordReader,
	rotate,
	updateCanvas,
	getMajor,
} from "./util";

class Scale extends React.Component {
	componentDidMount() {
		this.handleCanvas();
	}

	componentDidUpdate() {
		this.handleCanvas();
	}

	handleCanvas() {
		const ctx = this.refs.canvas.getContext("2d");
		const radius = 27;
		updateCanvas(ctx, radius, this.props.selectedNotes);
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

	noteComponents(notes, pegs, center, relMajor) {
		const { selectedNotes, rootReferenceEnabled } = this.props;
		const { rootIdx } = chordReader(selectedNotes);

		return notes.map((note, i) => {
			const color = i === rootIdx ? "red" : "black";
			let backgroundColor;
			let numLabel = null;

			if (selectedNotes[i]) {
				backgroundColor = "#FBF";
			} else {
				backgroundColor = note ? "#ABF" : "transparent";
			}

			if (pegs.includes(i)) {
				numLabel = i === relMajor[pegs.indexOf(i)] ? "" : "b";
				numLabel += `${pegs.indexOf(i) + 1}`;
			}

			const onClick = e => {
				e.stopPropagation();
				this.handleClick(i, pegs);
			};

			const style = {
				position: "absolute",
				width: NOTE_RADIUS,
				height: NOTE_RADIUS,
				borderRadius: NOTE_RADIUS,
				backgroundColor,
				border: `1px solid ${color}`,
				top: center.y - SCALE_RADIUS * Math.cos(Math.PI * i / 6),
				left: center.x + SCALE_RADIUS * Math.sin(Math.PI * i / 6),
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
		//if not a node, then treat as input component
		//

		const { node } = this.props;
		const { notes, center } = node;
		const { name, rootIdx } = keyReader(notes);
		const relMajor = getMajor(rootIdx);
		let pegs = getPegs(notes);

		while (pegs[0] !== rootIdx) pegs = rotate(pegs);

		const noteDivs = this.noteComponents(notes, pegs, center, relMajor);

		const label = this.props.handleClick
			? null
			: name.split(" ").map((piece, i) => {
					return <p key={i}>{piece}</p>;
			  });

		const onClick = this.props.handleClick
			? null
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
			top: center.y - SCALE_RADIUS + NOTE_RADIUS / 2,
			left: center.x - SCALE_RADIUS + NOTE_RADIUS / 2,
		};

		return (
			<div onClick={onClick}>
				{noteDivs}
				<div style={textStyle}>{label}</div>
				<canvas
					ref="canvas"
					width={2 * SCALE_RADIUS}
					height={2 * SCALE_RADIUS}
					style={canvasStyle}
				/>
			</div>
		);
	}
}

export default Scale;
