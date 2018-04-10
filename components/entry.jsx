import React from "react";
import ReactDOM from "react-dom";
import Scale from "./scale";
import Input from "./input";
import {
	ScaleNode,
	buildKeyWheel,
	getNotes,
	getPegs,
	getEmptySet,
} from "../util";
import { WHEEL_CENTER, CMAJOR, EMPTY, SCALE_SPACING } from "../consts";

const initialNotes = getNotes([0, 2, 4, 5, 7, 9, 11]);

const buttonStyle = {
	padding: "10px",
	border: "1px solid brown",
	backgroundColor: "rgba(100,100,255,0.5)",
	borderRadius: "5px",
	textAlign: "center",
};

class Root extends React.Component {
	constructor(props) {
		super(props);
		const start = new ScaleNode(initialNotes, WHEEL_CENTER());

		this.state = {
			scales: buildKeyWheel(start, SCALE_SPACING()),
			selected: getEmptySet(),
			mode: "union",
			rootReferenceEnabled: true,
			mute: true,
		};

		this.handleClick = this.handleClick.bind(this);
		this.handleGroup = this.handleGroup.bind(this);
		this.toggleRef = this.toggleRef.bind(this);
		this.toggleMode = this.toggleMode.bind(this);
		this.toggleMute = this.toggleMute.bind(this);
		this.rebuildKeyWheel = this.rebuildKeyWheel.bind(this);
		this.clearNotes = this.clearNotes.bind(this);
	}

	rebuildKeyWheel() {
		const width = SCALE_SPACING();
		const newCenter = { x: 6 * width, y: 4 * width };
		const newStart = new ScaleNode(initialNotes, newCenter);
		const scales = buildKeyWheel(newStart, width);
		this.setState({ scales });
	}

	clearNotes() {
		this.setState({ selected: getEmptySet() });
	}

	componentDidMount() {
		window.addEventListener("resize", this.rebuildKeyWheel);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.rebuildKeyWheel);
	}

	handleClick(i, id) {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push([...notes]);
		});
		selected[id][i] = !selected[id][i];
		this.setState({ selected });
	}

	handleGroup(notes, id) {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push([...notes]);
		});
		selected[id] = notes;
		this.setState({ selected });
	}

	toggleMode() {
		const mode = this.state.mode === "union" ? "intersection" : "union";
		this.setState({ mode });
	}

	toggleRef() {
		const rootReferenceEnabled = !this.state.rootReferenceEnabled;
		this.setState({ rootReferenceEnabled });
	}

	toggleMute() {
		const mute = !this.state.mute;
		this.setState({ mute });
	}

	scaleComponents() {
		const { selected, scales, rootReferenceEnabled, mode } = this.state;
		return scales.map((node, i) => {
			return (
				<Scale
					key={i}
					notes={node.notes}
					center={node.center}
					selected={selected}
					isInput={false}
					mode={mode}
					rootReferenceEnabled={rootReferenceEnabled}
					index={-1}
					mute={this.state.mute}
				/>
			);
		});
	}

	render() {
		const { selected, rootReferenceEnabled } = this.state;
		const scaleDivs = this.scaleComponents();
		return (
			<div>
				<div style={{ width: "65%", display: "inline-block" }}>{scaleDivs}</div>
				<div
					style={{
						width: "35%",
						display: "inline-block",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-evenly",
							paddingTop: "30px",
						}}
					>
						<button style={buttonStyle} onClick={this.toggleRef}>
							Reference: {this.state.rootReferenceEnabled ? "Scale" : "Numbers"}
						</button>
						<button style={buttonStyle} onClick={this.toggleMode}>
							Mode: {this.state.mode === "union" ? "Union" : "Intersection"}
						</button>
						<button style={buttonStyle} onClick={this.clearNotes}>
							Clear
						</button>
						<button style={buttonStyle} onClick={this.toggleMute}>
							{this.state.mute ? "Unmute" : "Mute"}
						</button>
					</div>
					<Input
						selected={selected}
						handleClick={this.handleClick}
						handleGroup={this.handleGroup}
						rootReferenceEnabled={rootReferenceEnabled}
						mode={this.state.mode}
						mute={this.state.mute}
					/>
				</div>
			</div>
		);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Root />, root);
});
