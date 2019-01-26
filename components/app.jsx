import React from "react";
import ReactDOM from "react-dom";
import Input from "./input";
import FretBoard from "./fretboard";
import Piano from "./piano";
import { KeyWheel } from "./keywheel";
import {
	ScaleNode,
	buildKeyWheel,
	getNotes,
	getPegs,
	getEmptySet,
	getMajor,
	dup,
} from "../util";
import { C, EMPTY, ROOT_REFERENCES, ORDERINGS } from "../consts";
import { buttonBlue } from "../colors";

const mainStyle = {
	boxSizing: "border-box",
};

const inlineWidgetStyle = {
	display: "inline-block",
	margin: "auto",
	width: "fit-content",
	verticalAlign: "top",
};

const buttonStyle = {
	padding: "3px",
	border: "1px solid brown",
	backgroundColor: buttonBlue,
	borderRadius: "5px",
	textAlign: "center",
	minWidth: "60px",
	height: "30px",
	fontSize: "14px",
};

const linkContainerStyle = {
	display: "flex",
	justifyContent: "flex-end",
	alignItems: "center",
	width: "100%",
	height: "40px",
	borderBottom: "2px solid black",
	marginBottom: "20px",
};

class App extends React.Component {
	constructor(props) {
		super(props);
		const start = new ScaleNode(C);

		this.state = {
			start: 0,
			scales: buildKeyWheel(start),
			selected: getEmptySet(),
			mode: "union",
			rootReference: "names",
			ordering: "chromatic",
			mute: false,
		};
	}

	componentDidMount() {
		window.addEventListener("keydown", this.handleKeyPress);
	}

	componentWillUnmount() {
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
			const selected = dup(this.state.selected);
			selected[i] = dup(EMPTY);
			this.setState({ selected });
		} else {
			this.setState({ selected: getEmptySet() });
		}
	};

	handleClick = (i, id) => {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push(dup(notes));
		});
		selected[id][i] = !selected[id][i];
		this.setState({ selected });
	};

	handleGroup = (notes, id) => {
		const selected = [];
		this.state.selected.forEach(notes => {
			selected.push(dup(notes));
		});
		selected[id] = notes;
		this.setState({ selected });
	};

	toggleMode = () => {
		const mode = this.state.mode === "union" ? "intersection" : "union";
		this.setState({ mode });
	};

	changeRef = e => {
		this.setState({ rootReference: e.currentTarget.value });
	};

	changeOrder = e => {
		this.setState({ ordering: e.currentTarget.value });
	};

	toggleMute = () => {
		const mute = !this.state.mute;
		this.setState({ mute });
	};

	render() {
		const { selected, scales, mute, mode, rootReference, ordering } = this.state;
		return (
			<div style={mainStyle}>
				<div style={linkContainerStyle}>
					<button style={buttonStyle} onClick={this.toggleMute}>
						{this.state.mute ? "Unmute" : "Mute"}
					</button>
					<button style={buttonStyle} onClick={this.clearNotes}>
						Clear All
					</button>
					<select onChange={this.changeRef} style={buttonStyle} defaultValue={"numbers"}>
						{Object.keys(ROOT_REFERENCES).map((key, i) => (
							<option
								key={`reference-${i}`}
								value={key}
							>
								Label: {ROOT_REFERENCES[key]}
							</option>
						))}
					</select>
					<select onChange={this.changeOrder} style={buttonStyle} defaultValue={"chromatic"}>
						{Object.keys(ORDERINGS).map((key, i) => (
							<option
								key={`ordering-${i}`}
								value={key}
							>
								{/* {When you return, fix this so the ordering is passed by prop down to Scale} */}
								{ORDERINGS[key]}
							</option>
						))}
					</select>
					<button style={buttonStyle} onClick={this.toggleMode}>
						Mode: {this.state.mode === "union" ? "Union" : "Intersection"}
					</button>
					<button style={buttonStyle}>
						<a href="https://github.com/seanjams/keywheel">source</a>
					</button>
				</div>
				<div>
					<div style={inlineWidgetStyle}>
						<KeyWheel
							selected={selected}
							scales={scales}
							rootReference={rootReference}
							mode={mode}
							mute={mute}
							ordering={ordering}
						/>
					</div>
					<div style={inlineWidgetStyle}>
						<Input
							selected={selected}
							handleClick={this.handleClick}
							handleGroup={this.handleGroup}
							clearNotes={this.clearNotes}
							rootReference={rootReference}
							mode={mode}
							mute={mute}
							ordering={ordering}
						/>
					</div>
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
				<div style={{ margin: "50px auto", width: "fit-content" }}>
					<Piano
						selected={selected}
						octaves={3}
						style={{
							width: "80vw",
							height: "10vw",
						}}
					/>
				</div>
			</div>
		);
	}
}

export default App;
