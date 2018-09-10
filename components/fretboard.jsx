import React from "react";
import isEqual from "lodash/isEqual";
import { EMPTY, NOTE_NAMES } from "../consts";
import { COLORS, offWhite } from "../colors";
import {
	rotate,
	chordFingerMachine,
	dup,
	getOctaveFrets,
	inRange,
	bStringStep,
} from "../util";
import { buttonBlue } from "../colors";

const buttonStyle = {
	padding: "3px",
	border: "1px solid brown",
	backgroundColor: buttonBlue,
	borderRadius: "5px",
	textAlign: "center",
	minWidth: "60px",
};

const byString = (a, b) => {
	if (b[0] == a[0]) return b[1] - a[1];
	return b[0] - a[0];
};

class FretBoard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chords: [],
			points: [],
			previewPoints: [],
		};
	}

	getLabelColors = () => {
		const selectedNotesByInput = {};
		const result = {};
		NOTE_NAMES.forEach(name => {
			selectedNotesByInput[name] = [];
		});

		this.props.selected.forEach((notes, i) => {
			notes.forEach((note, j) => {
				if (note) selectedNotesByInput[NOTE_NAMES[j]].push(i);
			});
		});

		NOTE_NAMES.forEach(name => {
			const colors = selectedNotesByInput[name].map(i => COLORS(1)[i]);

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
					background: "#ccc",
					color: "#444",
				};
			}
		});

		return result;
	};

	fretComponents = () => {
		const fretDivs = [];
		const clickHandlers = [];
		const colors = this.getLabelColors();
		const eString = rotate(dup(NOTE_NAMES), 5);

		const strings = Array(6)
			.fill(0)
			.map((_, i) => {
				const times = i > 3 ? 5 * i - 1 : 5 * i;
				let string = rotate(dup(eString), times);
				string = string.concat(string.slice(0, 4));
				return string;
			})
			.reverse();

		strings.forEach((noteNames, i) => {
			noteNames.forEach((name, j) => {
				const fretStyle = {
					boxShadow: "0px 0px 0px 2px #333",
					height: "100%",
					color: colors[name].color,
					background: colors[name].background,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					fontSize: "1.1vw",
				};

				const onClick = () => {
					let chords = dup(this.state.chords);
					let active = this.state.active;
					let previewPoints = [];

					if (!this.state.chords.length) {
						chords = getOctaveFrets([i, j]);
						this.setState({ chords, previewPoints });
						return;
					}

					let activeChord = chords[0];
					let handled = false;

					for (let k = 0; k < activeChord.length; k++) {
						if (isEqual(activeChord[k], [i, j])) {
							chords = chords.map(chord => {
								return chord.slice(0, k).concat(chord.slice(k + 1));
							});
							handled = true;
							break;
						} else if (activeChord[k][0] === i) {
							let diff = j - activeChord[k][1];
							chords = chords.map(chord => {
								chord[k][1] += diff;
								return chord;
							});
							handled = true;
							break;
						}
					}

					if (!handled) {
						let last = activeChord[activeChord.length - 1];
						let step = bStringStep(last[0], i);
						let delta = [i - last[0], j - last[1] - step];
						let nextString, nextFret;

						chords.forEach(chord => {
							// debugger;
							last = chord[chord.length - 1];
							nextString = last[0] + delta[0];
							step = bStringStep(last[0], nextString);
							nextFret = last[1] + delta[1] + step;
							chord.push([nextString, nextFret]);
							chord.sort(byString);
						});
					}

					this.setState({ chords, previewPoints });
				};

				const onMouseEnter = () => {
					if (!this.state.chords.length) return;
					let points = dup(this.state.chords[0]);
					let previewPoints = [];

					if (points[points.length - 1][0] > i) {
						previewPoints = [points[points.length - 1], [i, j]];
						this.setState({ previewPoints });
						return;
					} else if (points[0][0] < i) {
						previewPoints = [[i, j], points[0]];
						this.setState({ previewPoints });
						return;
					}

					for (let idx = 0; idx < points.length; idx++) {
						if (isEqual(points[idx], [i, j])) {
							this.setState({ previewPoints });
							return;
						} else if (points[idx][0] === i && points[idx][1] !== j) {
							if (idx - 1 >= 0) previewPoints.push(points[idx - 1]);
							previewPoints.push([i, j]);
							if (idx + 1 <= 5 && points[idx + 1])
								previewPoints.push(points[idx + 1]);

							this.setState({ previewPoints });
							return;
						}
					}

					points.push([i, j]);
					points.sort(byString);
					const idx = points.findIndex(point => point[0] === i);
					if (idx - 1 >= 0) previewPoints.push(points[idx - 1]);
					if (idx >= 0) previewPoints.push([i, j]);
					if (idx + 1 <= 5 && points[idx + 1])
						previewPoints.push(points[idx + 1]);
					this.setState({ previewPoints });
				};

				const onMouseLeave = () => {
					this.setState({ previewPoints: [] });
				};

				fretDivs.push(
					<div key={`fret-${noteNames.length * i + j}`} style={fretStyle}>
						{name}
					</div>
				);

				clickHandlers.push(
					<div
						key={`handler-${noteNames.length * i + j}`}
						style={{ height: "100%" }}
						onClick={onClick}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					/>
				);
			});
		});

		return { fretDivs, clickHandlers };
	};

	getPoints = points => {
		if (!points.length || points.some(point => !inRange(point))) return "";
		return points
			.map(point => {
				if (point) {
					return `${point[1] * 100 + 50},${point[0] * 33 + 16.5}`;
				} else {
					return "";
				}
			})
			.join(" ");
	};

	clearPoints = () => {
		this.setState({ chords: [], previewPoints: [] });
	};

	render() {
		let { chords, previewPoints } = this.state;
		const { fretDivs, clickHandlers } = this.fretComponents();
		chords = chords.map(chord => this.getPoints(chord));
		previewPoints = this.getPoints(previewPoints);

		const style = Object.assign({}, this.props.style, {
			position: "relative",
			display: "grid",
			gridTemplateColumns: "repeat(16, 1fr)",
		});

		const clickHandlerStyle = {
			...style,
			zIndex: 60,
			marginBottom: `-${this.props.style.height}`,
		};

		const svgContainerStyle = {
			position: "absolute",
			float: "left",
			height: "100%",
			width: "100%",
			zIndex: 50,
			top: 0,
			left: 0,
		};

		const activeLineStyle = {
			stroke: "green",
			strokeWidth: "5",
			fill: "none",
		};

		const lineStyle = {
			stroke: "purple",
			strokeWidth: "5",
			fill: "none",
		};

		const previewLineStyle = {
			stroke: "yellow",
			strokeWidth: "3",
			fill: "none",
			strokeDasharray: "5,5",
		};

		return (
			<div>
				<div style={clickHandlerStyle}>{clickHandlers}</div>
				<div style={style}>
					<div style={svgContainerStyle}>
						<svg width="100%" height="100%" viewBox="0 0 1600 198">
							{chords.map((chord, i) => {
								if (i === 0) {
									return (
										<polyline
											key={`line-${i}`}
											style={activeLineStyle}
											points={chord}
										/>
									);
								} else {
									return (
										<polyline
											key={`line-${i}`}
											style={lineStyle}
											points={chord}
										/>
									);
								}
							})}
							<polyline style={previewLineStyle} points={previewPoints} />
						</svg>
					</div>
					{fretDivs}
				</div>
				<button style={buttonStyle} onClick={this.clearPoints}>
					Clear
				</button>
			</div>
		);
	}
}

export default FretBoard;
