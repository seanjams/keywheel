import React from "react";
import Scale from "./scale";
import {
	EMPTY,
	SHAPE,
	NOTE_NAMES,
	SCALE_SPACING,
	TEXT_LABEL_SIZE,
	node,
	getInputNodes,
} from "../consts";
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
		const node = getInputNodes();
		return (
			<div>
				{selected.map((_, i) => {
					const scaleSpacing = SCALE_SPACING();
					return (
						<div key={i}>
							<div
								style={{
									position: "absolute",
									top: node[i].center.y - scaleSpacing - 10,
									left: node[i].center.x - 3 * scaleSpacing / 4,
									fontSize: `${TEXT_LABEL_SIZE()}px`,
								}}
							>
								<select onChange={e => this.onNameChange(e, i)}>
									{NOTE_NAMES.map((name, j) => {
										return (
											<option key={j} value={name} defaultValue={j === 0}>
												{name}
											</option>
										);
									})}
								</select>
								<select
									onChange={e => this.onChordChange(e, i)}
									style={{ width: 1.2 * scaleSpacing }}
								>
									{Object.keys(SHAPE).map((chordName, j) => {
										return (
											<option key={j} value={chordName} defaultValue={j === 0}>
												{chordName}
											</option>
										);
									})}
								</select>
							</div>
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
