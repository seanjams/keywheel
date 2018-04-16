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
	getMajor,
} from "../util";
import { WHEEL_CENTER, C, EMPTY, SCALE_SPACING, width } from "../consts";
import { buttonBlue } from "../colors";

const initialNotes = C;

const buttonStyle = {
	padding: "3px",
	border: "1px solid brown",
	backgroundColor: buttonBlue,
	borderRadius: "5px",
	textAlign: "center",
	minWidth: "100px",
};

class Root extends React.Component {
	constructor(props) {
		super(props);
		const start = new ScaleNode(initialNotes, WHEEL_CENTER());

		this.state = {
			start: 0,
			scales: buildKeyWheel(start, SCALE_SPACING(), false),
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
		this.shiftScale = this.shiftScale.bind(this);
	}

	componentDidMount() {
		window.addEventListener("resize", this.rebuildKeyWheel);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.rebuildKeyWheel);
	}

	rebuildKeyWheel() {
		const width = SCALE_SPACING();
		const newCenter = WHEEL_CENTER();
		const newNotes = getNotes(getMajor(this.state.start));
		const newStart = new ScaleNode(newNotes, newCenter);
		const flip = this.state.start > 6;
		const scales = buildKeyWheel(newStart, width, flip);
		this.setState({ scales });
	}

	shiftScale(inc) {
		const start = ((this.state.start + inc) % 12 + 12) % 12;
		this.setState({ start }, this.rebuildKeyWheel);
	}

	clearNotes() {
		this.setState({ selected: getEmptySet() });
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
				<div
					style={{ width: "65%", display: "inline-block", textAlign: "center" }}
				>
					{scaleDivs}
					<div
						style={{
							position: "relative",
							top: 6 * width() / 20,
						}}
					>
						<button
							onClick={() => this.shiftScale(2)}
							style={Object.assign({ marginRight: "50px" }, buttonStyle)}
						>
							Left
						</button>
						<button onClick={() => this.shiftScale(-2)} style={buttonStyle}>
							Right
						</button>
					</div>
				</div>

				<div
					style={{
						width: "35%",
						display: "inline-block",
						position: "relative",
						top: 6 * width() / 20,
					}}
				>
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-evenly",
								paddingTop: "30px",
							}}
						>
							<button style={buttonStyle} onClick={this.toggleRef}>
								View: {this.state.rootReferenceEnabled ? "Scale" : "Arbitrary"}
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
						<div
							style={{
								display: "flex",
								justifyContent: "space-evenly",
								paddingTop: "30px",
							}}
						>
							<button style={buttonStyle}>Blank</button>
							<button style={buttonStyle}>Blank</button>
							<button style={buttonStyle}>Blank</button>
							<button style={buttonStyle}>Blank</button>
						</div>
					</div>
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
		);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Root />, root);
});
