import React from "react";
import Scale from "./scale";
import { EMPTY, SHAPE, NOTE_NAMES, node } from "../consts";
import { getNotes } from "../util";
import isEqual from "lodash/isEqual";

//make dynamically placed inputs later

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noteName: "C",
			chordName: "major",
		};
	}

	calculateChord(i) {
		const { noteName, chordName } = this.state;
		const rootIdx = NOTE_NAMES.indexOf(noteName);
		const pegs = SHAPE[chordName].map(note => (note + rootIdx) % 12).sort();
		this.props.handleGroup(getNotes(pegs), i);
	}

	onNameChange(e, i) {
		const noteName = e.target.value;
		this.setState({ noteName }, () => this.calculateChord(i));
	}

	onChordChange(e, i) {
		const chordName = e.target.value;
		this.setState({ chordName }, () => this.calculateChord(i));
	}

	render() {
		const { selected } = this.props;
		return (
			<div>
				{selected.map((_, i) => {
					return (
						<div key={i}>
							<select onChange={e => this.onNameChange(e, i)}>
								{NOTE_NAMES.map((name, j) => {
									return (
										<option key={j} value={name} defaultValue={j === 0}>
											{name}
										</option>
									);
								})}
							</select>
							<select onChange={e => this.onChordChange(e, i)}>
								{Object.keys(SHAPE).map((chordName, j) => {
									return (
										<option key={j} value={chordName} defaultValue={j === 0}>
											{chordName}
										</option>
									);
								})}
							</select>
							<Scale
								notes={[...EMPTY]}
								center={node[i].center}
								selected={selected}
								handleClick={k => this.props.handleClick(k, i)}
								rootReferenceEnabled={this.props.rootReferenceEnabled}
								isInput={true}
								mode={this.props.mode}
								index={i}
							/>
						</div>
					);
				})}
			</div>
		);
	}
}

export default Input;
