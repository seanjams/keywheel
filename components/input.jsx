import React from "react";
import Scale from "./scale";
import {
	EMPTY,
	SHAPES,
	NOTE_NAMES,
	SCALE_SPACING,
	TEXT_LABEL_SIZE,
	node,
	getInputNodes,
} from "../consts";
import { getNotes, getPegs, soundNotes } from "../util";
import { buttonBlue } from "../colors";
import isEqual from "lodash/isEqual";

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noteNames: Array(8).fill("C"),
			chordNames: Array(8).fill("major"),
		};
	}

	calculateChord(i) {
		const { noteNames, chordNames } = this.state;
		const rootIdx = NOTE_NAMES.indexOf(noteNames[i]);
		const pegs = SHAPES[chordNames[i]]
			.map(note => (note + rootIdx) % 12)
			.sort();
		this.props.handleGroup(getNotes(pegs), i);
	}

	onNameChange(e, i) {
		const noteNames = [...this.state.noteNames];
		noteNames[i] = e.target.value;
		this.setState({ noteNames }, () => this.calculateChord(i));
	}

	onChordChange(e, i) {
		const chordNames = [...this.state.chordNames];
		chordNames[i] = e.target.value;
		this.setState({ chordNames }, () => this.calculateChord(i));
	}

	soundChord(i) {
		if (!this.props.mute) {
			const chord = getPegs(this.props.selected[i]);
			soundNotes(chord, 0, true);
		}
	}

	render() {
		const { selected } = this.props;
		const node = getInputNodes();
		return (
			<div>
				{selected.map((_, i) => {
					const scaleSpacing = SCALE_SPACING();

					const buttonStyle = {
						padding: "3px",
						border: "1px solid brown",
						backgroundColor: buttonBlue,
						borderRadius: "5px",
						textAlign: "center",
						marginRight: "5px",
					};

					const buttonContainerStyle = {
						position: "absolute",
						top: node[i].center.y - 1.4 * scaleSpacing,
						left: node[i].center.x - scaleSpacing / 2,
						fontSize: `${TEXT_LABEL_SIZE()}px`,
						display: "flex",
					};

					const selectContainerStyle = {
						position: "absolute",
						top: node[i].center.y - scaleSpacing,
						left: node[i].center.x - 3 * scaleSpacing / 4,
						fontSize: `${TEXT_LABEL_SIZE()}px`,
					};

					return (
						<div key={i}>
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
							<div>
								<div style={selectContainerStyle}>
									<select
										onChange={e => this.onNameChange(e, i)}
										defaultValue=""
									>
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
									<select
										onChange={e => this.onChordChange(e, i)}
										style={{ width: 1.2 * scaleSpacing }}
										defaultValue=""
									>
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
								<Scale
									notes={[...EMPTY]}
									center={node[i].center}
									index={i}
									selected={selected}
									handleClick={k => this.props.handleClick(k, i)}
									rootReferenceEnabled={this.props.rootReferenceEnabled}
									isInput={true}
									mode={this.props.mode}
									mute={this.state.mute}
								/>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
}

export default Input;
