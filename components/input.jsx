import React from "react";
import Scale from "./scale";
import { EMPTY, SHAPES, NOTE_NAMES } from "../consts";
import { getNotes, getPegs, soundNotes, chordReader, dup } from "../util";
import { buttonBlue } from "../colors";
import isEqual from "lodash/isEqual";

const containerStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(4, 1fr)",
	gridAutoRows: "2.5vw 2.5vw 10vw 2.5vw 2.5vw 10vw",
	justifyItems: "center",
	alignItems: "center",
	width: "40vw",
	height: "30vw",
};

const buttonStyle = {
	padding: "3px",
	border: "1px solid brown",
	backgroundColor: buttonBlue,
	borderRadius: "5px",
	textAlign: "center",
	fontSize: "1vw",
};

const buttonContainerStyle = {
	display: "flex",
	justifyContent: "center",
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
		const buttonDivs = [];
		const scaleDivs = [];
		const selectDivs = [];

		selected.forEach((_, i) => {
			buttonDivs.push(
				<div style={buttonContainerStyle} key={3 * i}>
					<button style={buttonStyle} onClick={() => this.soundChord(i)}>
						Sound
					</button>
					<button style={buttonStyle} onClick={() => this.props.clearNotes(i)}>
						Clear
					</button>
				</div>
			);

			selectDivs.push(
				<div style={selectContainerStyle} key={3 * i + 1}>
					<select onChange={e => this.onNameChange(e, i)} defaultValue="">
						<option disabled value="">
							--
						</option>
						{NOTE_NAMES.map((name, j) => {
							return (
								<option key={j} value={name}>
									{name}
								</option>
							);
						})}
					</select>
					<select onChange={e => this.onChordChange(e, i)} defaultValue="">
						<option disabled value="">
							--
						</option>
						{Object.keys(SHAPES).map((chordName, j) => {
							return (
								<option key={j} value={chordName}>
									{chordName}
								</option>
							);
						})}
					</select>
				</div>
			);

			scaleDivs.push(
				<Scale
					notes={dup(EMPTY)}
					index={i}
					selected={selected}
					handleClick={k => this.props.handleClick(k, i)}
					rootReferenceEnabled={this.props.rootReferenceEnabled}
					isInput={true}
					mode={this.props.mode}
					mute={this.state.mute}
					key={3 * i + 2}
					style={{
						width: "100%",
						height: "100%",
						position: "relative",
					}}
				/>
			);
		});

		const domNodes = buttonDivs
			.slice(0, 4)
			.concat(selectDivs.slice(0, 4))
			.concat(scaleDivs.slice(0, 4))
			.concat(buttonDivs.slice(4))
			.concat(selectDivs.slice(4))
			.concat(scaleDivs.slice(4));

		return <div style={containerStyle}>{domNodes}</div>;
	}
}

export default Input;
