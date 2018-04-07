import React from "react";
import ReactDOM from "react-dom";
import Scale from "./scale";
import Input from "./input";
import {
	ScaleNode,
	buildKeyWheel,
	getNotes,
	getPegs,
	CMAJOR,
	EMPTY,
} from "./util";

const initialNotes = getNotes([0, 2, 4, 5, 7, 9, 11]);

const intialCenter = {
	x: 720,
	y: 350,
};

class Root extends React.Component {
	constructor(props) {
		super(props);
		const start = new ScaleNode(initialNotes, intialCenter);

		this.state = {
			scales: buildKeyWheel(start),
			selected: [...EMPTY],
			rootReferenceEnabled: false,
		};

		this.handleClick = this.handleClick.bind(this)
		this.toggleRef = this.toggleRef.bind(this)
	}

	handleClick(i) {
		const selected = [...this.state.selected];
		selected[i] = !selected[i];
		this.setState({ selected });
	};

	toggleRef() {
		const rootReferenceEnabled = !this.state.rootReferenceEnabled;
		this.setState({ rootReferenceEnabled });
	};

	scaleComponents() {
		const { selected, scales, rootReferenceEnabled } = this.state;
		const pegs = getPegs(selected);

		return scales.map((node, i) => {
			const isMatch = pegs.every(i => node.notes[i]);
			const selectedNotes = isMatch ? selected : [];

			return (
				<Scale
					key={i}
					node={node}
					selectedNotes={selectedNotes}
					handleClick={this.handleClick}
					rootReferenceEnabled={rootReferenceEnabled}
				/>
			);
		});
	};

	render() {
		const scaleDivs = this.scaleComponents()
		return (
			<div>
				<Input
					handleClick={this.handleClick}
					toggleRef={this.toggleRef}
					rootReferenceEnabled={this.state.rootReferenceEnabled}
				/>
				<div style={{ width: "80%" }}>{scaleDivs}</div>
			</div>
		);
	};
}

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Root />, root);
});
