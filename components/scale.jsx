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

import { NOTE_RADIUS, SCALE_RADIUS, NOTE_NAMES, EMPTY } from "../consts";

import {
	getPegs,
	mergeNotes,
	chordReader,
	rotate,
	soundNotes,
	getMajor,
} from "../util";

const textStyle = {
	position: "relative",
	top: "30%",
	textAlign: "center",
	height: 0,
	fontSize: "1vw",
};

const svgContainerStyle = {
	position: "absolute",
	top: 0,
	left: 0,
};

class Scale extends React.Component {
	constructor(props) {
		super(props);
	}

	getSVG() {
		const { notes, selected, mode, index, isInput } = this.props;
		let result = [];
		let colorIdx = 8;

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
				result.push(isMatch && pegs.length > 0 ? arr : []);
			});
		}

		return result.map((arr, i) => {
			if (arr.length === 0) return null;
			const pegs = getPegs(arr);
			if (pegs.length < 3) return null;

			const style = { stroke: grey, strokeWidth: 1 };
			style.fill = result.length > 1 ? COLORS(0.5)[i] : COLORS(0.5)[colorIdx];

			const points = pegs.map((peg, i) => {
				const x =
					SCALE_RADIUS * (1 + Math.sin(Math.PI * peg / 6)) + NOTE_RADIUS;
				const y =
					SCALE_RADIUS * (1 - Math.cos(Math.PI * peg / 6)) + NOTE_RADIUS;
				return `${x},${y}`;
			});

			return {
				points: points.join(" "),
				style: style,
			};
		});
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

	noteComponents(notes, pegs, relMajor, rootIdx = -1) {
		const { selected, rootReferenceEnabled, isInput, index } = this.props;

		return notes.map((note, i) => {
			let color = darkGrey;
			let borderColor = darkGrey;
			let backgroundColor = transparent;
			let noteColor = null;
			let numLabel = null;

			const isMatch = () =>
				selected.some((arr, j) => {
					const arrPegs = getPegs(arr);
					const match =
						arr[i] && arrPegs.length > 0 && arrPegs.every(k => notes[k]);
					if (match && !noteColor) noteColor = COLORS(1)[j];
					return match;
				});

			if (isInput) {
				numLabel = NOTE_NAMES[i];
				if (selected[index][i]) {
					backgroundColor = COLORS(1)[index];
					color = offWhite;
					if (i === rootIdx) {
						color = gold;
						borderColor = brown;
					}
				}
			} else {
				if (isMatch()) {
					backgroundColor = noteColor;
					color = offWhite;
				} else if (note) {
					backgroundColor = grey;
				}

				if (pegs.includes(i)) {
					const idx = pegs.indexOf(i);
					numLabel = i === relMajor[idx] ? "" : "b";
					numLabel += `${idx + 1}`;
				}
			}

			const onClick = e => {
				e.stopPropagation();
				this.handleClick(pegs, i);
			};

			const style = {
				position: "relative",
				display: "float",
				width: `${2 * NOTE_RADIUS}%`,
				height: `${2 * NOTE_RADIUS}%`,
				borderRadius: "50%",
				backgroundColor,
				boxSizing: "border-box",
				border: `1px solid ${borderColor}`,
				top: `${SCALE_RADIUS * (1 - Math.cos(Math.PI * i / 6)) -
					2 * NOTE_RADIUS * i}%`,
				left: `${SCALE_RADIUS * (1 + Math.sin(Math.PI * i / 6))}%`,
			};

			const numLabelStyle = {
				color,
				fontSize: "0.8vw",
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
		const { notes, selected, isInput, index } = this.props;
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

		const noteDivs = this.noteComponents(notes, pegs, relMajor, chordRootIdx);
		const svg = this.getSVG();

		return (
			<div onClick={onClick} style={Object.assign({}, this.props.style)}>
				<div style={svgContainerStyle}>
					<svg width="100%" height="100%" viewBox="0 0 100 100">
						{Array(selected.length)
							.fill(0)
							.map((_, i) => {
								if (svg[i])
									return (
										<polygon
											points={svg[i].points}
											style={svg[i].style}
											key={i}
										/>
									);
							})}
					</svg>
				</div>
				<div style={textStyle}>{label}</div>
				{noteDivs}
			</div>
		);
	}
}

export default Scale;
