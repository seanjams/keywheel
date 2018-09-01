import React from "react";
import ReactDOM from "react-dom";
import Scale from "./scale";
import Input from "./input";
import FretBoard from "./fretboard";
import {
	ScaleNode,
	buildKeyWheel,
	getNotes,
	getPegs,
	getEmptySet,
	getMajor,
} from "../util";
import { C, EMPTY } from "../consts";
import { buttonBlue } from "../colors";

const mainStyle = {
	boxSizing: "border-box",
};

const buttonStyle = {
	padding: "3px",
	border: "1px solid brown",
	backgroundColor: buttonBlue,
	borderRadius: "5px",
	textAlign: "center",
	minWidth: "60px",
};

class Root extends React.Component {
	constructor(props) {
		super(props);
		const start = new ScaleNode(C);

		this.state = {
			start: 0,
			scales: buildKeyWheel(start),
			selected: getEmptySet(),
			mode: "union",
			rootReferenceEnabled: true,
			mute: false,
		};
	}

	componentDidMount() {
		// window.addEventListener("resize", this.rebuildKeyWheel);
		window.addEventListener("keydown", this.handleKeyPress);
	}

	componentWillUnmount() {
		// window.removeEventListener("resize", this.rebuildKeyWheel);
		window.removeEventListener("keydown", this.handleKeyPress);
	}

	handleKeyPress = e => {
		if (e.key === "ArrowLeft") {
			this.shiftScale(2);
		} else if (e.key === "ArrowRight") {
			this.shiftScale(-2);
		}
	};

	rebuildKeyWheel = () => {
		const newNotes = getNotes(getMajor(this.state.start));
		const newStart = new ScaleNode(newNotes);
		const flip = this.state.start > 6 ? -1 : 1;
		const scales = buildKeyWheel(newStart, flip);
		this.setState({ scales });
	};

	shiftScale = inc => {
		const start = (((this.state.start + inc) % 12) + 12) % 12;
		this.setState({ start }, this.rebuildKeyWheel);
	};

	clearNotes = (i = -1) => {
		if (i >= 0) {
			const selected = [...this.state.selected];
			selected[i] = [...EMPTY];
			this.setState({ selected });
		} else {
			this.setState({ selected: getEmptySet() });
		}
	};

	handleClick = (i, id) => {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push([...notes]);
		});
		selected[id][i] = !selected[id][i];
		this.setState({ selected });
	};

	handleGroup = (notes, id) => {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push([...notes]);
		});
		selected[id] = notes;
		this.setState({ selected });
	};

	toggleMode = () => {
		const mode = this.state.mode === "union" ? "intersection" : "union";
		this.setState({ mode });
	};

	toggleRef = () => {
		const rootReferenceEnabled = !this.state.rootReferenceEnabled;
		this.setState({ rootReferenceEnabled });
	};

	toggleMute = () => {
		const mute = !this.state.mute;
		this.setState({ mute });
	};

	scaleComponents() {
		const { selected, scales, rootReferenceEnabled, mode } = this.state;
		return scales.map((node, i) => {
			const rowShift = i % 12 > 5 ? 1 : 0;
			const colStart = 4 * (i % 6) + 2 * rowShift + 1;
			const rowStart = 2 * Math.floor(6 * (i / 36)) + 1;

			const style = {
				position: "relative",
				gridColumn: `${colStart}/ span 3`,
				gridRow: `${rowStart}/ span 3`,
			};

			return (
				<Scale
					key={i}
					notes={node.notes} //array of 12 bools, the notes that are part of the scale
					selected={selected} //array of 8 separate notes objects for svg and coloring
					isInput={false} //bool for styling svg and event handlers of input type scales
					mode={mode} //string for deciding how to render svg
					rootReferenceEnabled={rootReferenceEnabled} //bool for labeling notes or numbers
					index={-1} //int for color index of input type scales
					mute={this.state.mute} //bool for volume
					style={style}
				/>
			);
		});
	}

	render() {
		const { selected, rootReferenceEnabled } = this.state;
		const scaleDivs = this.scaleComponents();
		return (
			<div style={mainStyle}>
				<div
					style={{
						display: "inline-block",
						margin: "auto",
						width: "fit-content",
					}}
				>
					<div
						style={{
							display: "grid",
							height: "30vw",
							width: "60vw",
							gridTemplateColumns: "2fr repeat(12, 5fr 2fr) 2fr",
							gridTemplateRows: "2fr repeat(6, 5fr 2fr)",
						}}
					>
						{scaleDivs}
					</div>
				</div>
				<div
					style={{
						display: "inline-block",
						margin: "auto",
						width: "fit-content",
					}}
				>
					<Input
						selected={selected}
						handleClick={this.handleClick}
						handleGroup={this.handleGroup}
						clearNotes={this.clearNotes}
						rootReferenceEnabled={rootReferenceEnabled}
						mode={this.state.mode}
						mute={this.state.mute}
					/>
				</div>
				<div style={{ margin: "50px auto", width: "fit-content" }}>
					<FretBoard
						selected={selected}
						style={{
							width: "80vw",
							height: "10vw",
						}}
					/>
				</div>

				{/* <div style={{ display: "flex" }}>
					<button
						onClick={() => this.shiftScale(2)}
						style={Object.assign({ marginRight: "50px" }, buttonStyle)}
					>
						Left
					</button>
					<button onClick={() => this.shiftScale(-2)} style={buttonStyle}>
						Right
					</button>
				</div> */}
				<div>
					<div style={{ display: "flex" }}>
						<button style={buttonStyle} onClick={this.toggleMute}>
							{this.state.mute ? "Unmute" : "Mute"}
						</button>
						<button style={buttonStyle} onClick={this.clearNotes}>
							Clear All
						</button>
						<button style={buttonStyle} onClick={this.toggleRef}>
							View: {this.state.rootReferenceEnabled ? "Scale" : "Arbitrary"}
						</button>
						<button style={buttonStyle} onClick={this.toggleMode}>
							Mode: {this.state.mode === "union" ? "Union" : "Intersection"}
						</button>
					</div>
				</div>
			</div>
		);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Root />, root);
});
