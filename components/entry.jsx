import React from "react";
import ReactDOM from "react-dom";
import Scale from "./scale";
import Input from "./input";
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
			selected: [
				[...EMPTY],
				[...EMPTY],
				[...EMPTY],
				[...EMPTY],
				[...EMPTY],
				[...EMPTY],
				[...EMPTY],
				[...EMPTY],
			],
			mode: "each", //all, each
			rootReferenceEnabled: true,
		};

		this.handleClick = this.handleClick.bind(this);
		this.toggleRef = this.toggleRef.bind(this);
	}

	handleClick(i, id) {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push([...notes]);
		});
		selected[id][i] = !selected[id][i];
		this.setState({ selected });
	}

	toggleRef() {
		const rootReferenceEnabled = !this.state.rootReferenceEnabled;
		this.setState({ rootReferenceEnabled });
	}

	scaleComponents() {
		const { selected, scales, rootReferenceEnabled, mode } = this.state;
		return scales.map((node, i) => {
			return (
				<Scale
					key={i}
					node={node}
					selected={selected}
					mode={mode}
					rootReferenceEnabled={rootReferenceEnabled}
				/>
			);
		});
	}

	render() {
		const { selected, rootReferenceEnabled } = this.state;
		const scaleDivs = this.scaleComponents();
		return (
			<div>
				<div style={{ width: "60%" }}>{scaleDivs}</div>
				<button onClick={this.toggleRef}>Reference Root</button>
				<Input
					selected={selected}
					handleClick={this.handleClick}
					rootReferenceEnabled={rootReferenceEnabled}
				/>
			</div>
		);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Root />, root);
});
