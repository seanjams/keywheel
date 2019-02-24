import React from "react";
import Scale from "./scale";
import { EMPTY, SHAPES, NOTE_NAMES } from "../consts";
import { getNotes, getPegs, soundNotes, chordReader, dup } from "../util";
import { buttonBlue } from "../colors";
import isEqual from "lodash/isEqual";

const containerStyle = {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	width: "100%",
	height: "100%",
};

const buttonStyle = {
	padding: "5px",
	backgroundColor: "#aaa",
	borderRadius: 0,
	margin: "5px",
	textAlign: "center",
	minWidth: "60px",
	height: "30px",
	fontSize: "1vw",
};

const buttonContainerStyle = {
	display: "flex",
	justifyContent: "center",
	width: "100%",
	margin: "10px auto",
};

const optionContainerStyle = {
	height: "100%",
	display: "flex",
	flexDirection: "column",
};

const selectContainerStyle = {
	display: "flex",
	justifyContent: "center",
	fontSize: "1vw",
	width: "100%",
	margin: "10px auto",
};

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noteNames: Array(8).fill("C"),
			chordNames: Array(8).fill("major"),
		};
	}

	componentDidMount() {
		window.addEventListener("keypress", this.handleKeyPress);
	}

	componentWillUnmount() {
		window.removeEventListener("keypress", this.handleKeyPress);
	}

	handleKeyPress = e => {
		const i = parseInt(e.key);
		if (i > 0 && i < 9) this.soundChord(i - 1);
	};

	calculateChord(i) {
		const { noteNames, chordNames } = this.state;
		const rootIdx = NOTE_NAMES.indexOf(noteNames[i]);
		const pegs = SHAPES[chordNames[i]]
			.map(note => (note + rootIdx) % 12)
			.sort();
		this.props.handleGroup(getNotes(pegs), i);
	}

	onNameChange(e, i) {
		const noteNames = dup(this.state.noteNames);
		noteNames[i] = e.target.value;
		this.setState({ noteNames }, () => this.calculateChord(i));
	}

	onChordChange(e, i) {
		const chordNames = dup(this.state.chordNames);
		chordNames[i] = e.target.value;
		this.setState({ chordNames }, () => this.calculateChord(i));
	}

	soundChord(i) {
		if (!this.props.mute) {
			const { rootIdx } = chordReader(this.props.selected[i]);
			const chord = getPegs(this.props.selected[i]);
			const modeIdx = chord.indexOf(rootIdx);
			soundNotes(chord, modeIdx, true);
		}
	}

	render() {
		const { selected } = this.props;

		return (
			<div style={containerStyle}>
				{selected.map((_, i) => {
					return (
						<div
							key={`input-${i}`}
							style={{ textAlign: "center", margin: "10px" }}
						>
							<h3>Chord {i + 1}</h3>
							<div style={buttonContainerStyle}>
								<button style={buttonStyle} onClick={() => this.soundChord(i)}>
									Sound
								</button>
								<button
									style={buttonStyle}
									onClick={() => this.props.clearNotes(i)}
								>
									Clear
								</button>
							</div>
							<div style={selectContainerStyle}>
								<select onChange={e => this.onNameChange(e, i)} defaultValue="">
									<option disabled value="">
										--
									</option>
									{NOTE_NAMES.map((name, j) => {
										return (
											<option key={`note-name-${j}`} value={name}>
												{name}
											</option>
										);
									})}
								</select>
								<select
									onChange={e => this.onChordChange(e, i)}
									defaultValue=""
								>
									<option disabled value="">
										--
									</option>
									{Object.keys(SHAPES).map((chordName, j) => {
										return (
											<option key={`chord-name-${j}`} value={chordName}>
												{chordName}
											</option>
										);
									})}
								</select>
							</div>
							<Scale
								notes={dup(EMPTY)}
								index={i}
								selected={selected}
								handleClick={k => this.props.handleClick(k, i)}
								rootReference={this.props.rootReference}
								isInput={true}
								mode={this.props.mode}
								mute={this.state.mute}
								ordering={this.state.ordering}
								style={{
									width: "10vw",
									height: "10vw",
									position: "relative",
								}}
							/>
						</div>
					);
				})}
			</div>
		);
	}
}

export default Input;
