import React from "react";
import isEqual from "lodash/isEqual";
import {
	darkGrey,
	grey,
	offWhite,
	gold,
	brown,
	transparent,
	COLORS,
} from "../colors";

import {
	NOTE_RADIUS,
	SCALE_RADIUS,
	NUM_LABEL_SIZE,
	TEXT_LABEL_SIZE,
	NOTE_NAMES,
	EMPTY,
} from "../consts";

import {
	keyReader,
	getPegs,
	mergeNotes,
	chordReader,
	rotate,
	updateCanvas,
	soundNotes,
	getMajor,
} from "../util";

class Scale extends React.Component {
	constructor(props) {
		super(props);
		this.updateRadius = this.updateRadius.bind(this);
		this.updateRadius();
	}

	updateRadius() {
		if (this.props.isInput) {
			this.scaleRadius = 1.2 * SCALE_RADIUS();
			this.noteRadius = 1.3 * NOTE_RADIUS();
			this.numLabelSize = `${0.1 + NUM_LABEL_SIZE()}em`;
			this.textLabelSize = `${1 + TEXT_LABEL_SIZE()}px`;
		} else {
			this.scaleRadius = SCALE_RADIUS();
			this.noteRadius = NOTE_RADIUS();
			this.numLabelSize = `${NUM_LABEL_SIZE()}em`;
			this.textLabelSize = `${TEXT_LABEL_SIZE()}px`;
		}
	}

	componentDidMount() {
		this.handleCanvas();
		window.addEventListener("resize", this.updateRadius);
	}

	componentDidUpdate() {
		this.handleCanvas();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateRadius);
	}

	handleCanvas() {
		const ctx = this.refs.canvas.getContext("2d");
		const radius = this.scaleRadius;
		const { notes, selected, mode, index, isInput } = this.props;
		let result = [];
		let colorIdx;

		if (isInput) {
			if (index >= 0) {
				result.push(selected[index]);
				colorIdx = index;
			}
		} else if (mode === "intersection") {
			const collected = mergeNotes(selected);
			const pegs = getPegs(collected);
			const isMatch = pegs.every(i => notes[i]);
			if (isMatch && pegs.length > 0) result.push(collected);
		} else if (mode === "union") {
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

	handleClick(pegs, i) {
		if (this.props.handleClick) {
			this.props.handleClick(i);
		} else if (!this.props.mute) {
			if (i === "root") {
				soundNotes(pegs, 0, false);
				return;
			}
			let idx = pegs.indexOf(i);
			if (idx >= 0) soundNotes(pegs, idx, false);
		}
	}

	noteComponents(notes, pegs, center, relMajor, rootIdx = -1) {
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
					if (rootIdx >= 0 && i === rootIdx) {
						color = gold;
						borderColor = brown;
					} else {
						color = offWhite;
					}
				}

				numLabel = NOTE_NAMES[i];
			} else {
				if (isMatch()) {
					backgroundColor = noteColor;
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
				this.handleClick(pegs, i);
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
				fontSize: this.numLabelSize,
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
		const { name: keyName, rootIdx: keyRootIdx } = chordReader(notes);
		const { name: chordName, rootIdx: chordRootIdx } = chordReader(
			selected[index]
		);
		const relMajor = getMajor(keyRootIdx);
		let pegs = getPegs(notes);
		let label;
		let onClick;

		for (let i = 0; i < pegs.length; i++) {
			if (pegs[0] === keyRootIdx) break;
			pegs = rotate(pegs);
		}

		if (isInput) {
			label =
				chordName &&
				chordName.split(" ").map((piece, i) => {
					return <p key={i}>{piece}</p>;
				});

			onClick = () => {};
		} else {
			label =
				keyName &&
				keyName.split(" ").map((piece, i) => {
					return <p key={i}>{piece}</p>;
				});

			onClick = () => this.handleClick(pegs, "root");
		}

		const noteDivs = this.noteComponents(
			notes,
			pegs,
			center,
			relMajor,
			chordRootIdx
		);

		const textStyle = {
			position: "absolute",
			top: center.y - 4,
			left: center.x,
			fontSize: this.textLabelSize,
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
				<div style={textStyle}>
					<span style={{ position: "relative", left: "-25%" }}>{label}</span>
				</div>
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
