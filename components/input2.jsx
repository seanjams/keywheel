import React from "react";
import Scale from "./scale";
import { EMPTY } from "./util";
import isEqual from "lodash/isEqual";

const colors = [
	"rgba(255,100,100,0.5)",
	"rgba(155,0,255,0.5)",
	"rgba(255,0,155,0.5)",
	"rgba(255,100,0,0.5)",
	"rgba(0,155,0,0.5)",
	"rgba(0,255,0,0.5)",
	"rgba(255,255,0,0.5)",
	"rgba(255,0,0,0.5)",
];

const node = [
	{
		notes: [...EMPTY],
		center: {
			x: 200,
			y: 500,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 300,
			y: 500,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 400,
			y: 500,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 500,
			y: 500,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 200,
			y: 600,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 300,
			y: 600,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 400,
			y: 600,
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: 500,
			y: 600,
		},
	},
];

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

	handleClick(i, id) {
		const selectedNotes = Object.assign({}, this.state.selectedNotes);
		selectedNotes[id][i] = !selectedNotes[id][i];

		this.setState({ selectedNotes });
		const notes = this.collectNotes();

		if (!isEqual(notes, this.props.selected)) {
			this.props.handleClick(i);
		}
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

		return (
			<div>
				{[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
					return (
						<Scale
							key={i}
							node={node[i]}
							selectedNotes={selectedNotes[i]}
							handleClick={j => this.handleClick(j, i)}
							rootReferenceEnabled={this.props.rootReferenceEnabled}
							isInput={true}
							color={colors[i]}
						/>
					);
				})}
			</div>
		);
	}
}

export default Input;
