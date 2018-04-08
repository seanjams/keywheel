import React from "react";
import ReactDOM from "react-dom";
import Scale from "./scale";
import Input from "./input2";
import {
	WHEEL_CENTER,
	CMAJOR,
	EMPTY,
	ScaleNode,
	buildKeyWheel,
	getNotes,
	getPegs,
} from "./util";

const initialNotes = getNotes([0, 2, 4, 5, 7, 9, 11]);

class Root extends React.Component {
	constructor(props) {
		super(props);
		const start = new ScaleNode(initialNotes, WHEEL_CENTER);

		this.state = {
			scales: buildKeyWheel(start),
			selected: [...EMPTY],
			rootReferenceEnabled: false,
		};

		this.handleClick = this.handleClick.bind(this);
		this.toggleRef = this.toggleRef.bind(this);
	}

	handleClick(i) {
		const selected = [...this.state.selected];
		selected[i] = !selected[i];
		this.setState({ selected });
	}

	toggleRef() {
		const rootReferenceEnabled = !this.state.rootReferenceEnabled;
		this.setState({ rootReferenceEnabled });
	}

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
					rootReferenceEnabled={rootReferenceEnabled}
				/>
			);
		});
	}

	render() {
		const scaleDivs = this.scaleComponents();
		return (
			<div>
				<div style={{ width: "60%" }}>{scaleDivs}</div>
				<button onClick={this.toggleRef}>Reference Root</button>
				<Input
					selected={this.state.selected}
					handleClick={this.handleClick}
					rootReferenceEnabled={this.state.rootReferenceEnabled}
				/>
			</div>
		);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Root />, root);
});
