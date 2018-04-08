import React from "react";
import Scale from "./scale";
import { EMPTY } from "./util";
import { isEqual } from "lodash";

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedNotes: {
				0: [...EMPTY],
				1: [...EMPTY],
				2: [...EMPTY],
				3: [...EMPTY],
				4: [...EMPTY],
				5: [...EMPTY],
				6: [...EMPTY],
				7: [...EMPTY],
			},
		};
		this.handleClick = this.handleClick.bind(this);
	}

	// componentDidMount() {
	// 	this.handleCanvas();
	// }

	// componentDidUpdate() {
	// 	this.handleCanvas();
	// }

	// handleCanvas() {
	// 	const ctx = this.refs.canvas.getContext("2d");
	// 	const radius = 80;
	// 	updateCanvas(ctx, radius, this.state.notes);
	// }

	handleClick(i, id) {
		const selectedNotes = Object.assign({}, this.state.selectedNotes);
		selectedNotes[id][i] = !selectedNotes[id][i];

		this.setState({ selectedNotes });
		const notes = this.collectNotes();

		if (!isEqual(notes, this.props.selected)) {
			this.props.handleClick(i);
		}
		//generate subset of notes to send back up top
		// this.props.handleClick()
	}

	collectNotes() {
		const result = [...EMPTY];
		Object.values(this.state.selectedNotes).forEach(notes => {
			notes.forEach((note, i) => {
				if (note) result[i] = true;
			});
		});
		return result;
	}

	render() {
		const { selectedNotes } = this.state;
		const node = {
			notes: [...EMPTY],
			center: {
				x: 500,
				y: 500,
			},
		};

		return (
			<div>
				{[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
					<Scale
						node={node[i]}
						selectedNotes={selectedNotes[i]}
						handleClick={j => this.handleClick(j, i)}
						rootReferenceEnabled={this.props.rootReferenceEnabled}
					/>;
				})}
			</div>
		);
	}
}

export default Input;
