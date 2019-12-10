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
	mod,
	onCopyToClipboard,
	fallbackCopyTextToClipboard,
	nodeFromRoot
} from "../util";
import { C, EMPTY, ROOT_REFERENCES, ORDERINGS, NOTE_NAMES, SHAPES } from "../consts";
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

const titleStyle = {
	fontSize: "26px",
	padding: "10px",
};

const buttonStyle = {
	padding: "5px",
	backgroundColor: "#aaa",
	borderRadius: 0,
	margin: "5px",
	textAlign: "center",
	minWidth: "60px",
	height: "30px",
	fontSize: "14px",
};

const navBarStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	width: "100%",
	borderBottom: "2px solid black",
	marginBottom: "20px",
};

const linkContainerStyle = {
	display: "flex",
	justifyContent: "flex-end",
	alignItems: "center",
};

class App extends React.Component {
	constructor(props) {
		super(props);

		// starting keywheel centered on "C"
		const start = 0;

		this.state = {
			start,
			selected: getEmptySet(),
			mode: "union",
			rootReference: "names",
			ordering: "chromatic",
			mute: false,
			noteNames: Array(8).fill("C"),
			chordNames: Array(8).fill("major"),
		};
	}

	componentDidMount() {
		this.rehydrateState(this.rebuildKeyWheel);
		window.addEventListener("keydown", this.handleKeyPress);
		window.addEventListener("beforeunload", this.saveToLocalStorage);
	}

	componentWillUnmount() {
		this.saveToLocalStorage();
		window.removeEventListener("beforeunload", this.saveToLocalStorage);
		window.removeEventListener("keydown", this.handleKeyPress);
	}

	saveToLocalStorage = () => {
		for (let key in this.state) {
			if (key !== "scales") localStorage.setItem(key, JSON.stringify(this.state[key]));
		}
	};

	rehydrateState = cb => {
		let newState = {};
		for (let key in this.state) {
			if (this.props.state) {
				newState[key] = this.props.state[key];
			} else if (localStorage.hasOwnProperty(key)) {
				let val = localStorage.getItem(key);
				try {
					val = JSON.parse(val);
					newState[key] = val;
				} catch (e) {
					newState[key] = this.state[key];
				}
			}
		}

		this.setState(newState, cb);
	};

	onSaveToClipboard = e => {
		// save state to URL
		const state = dup(this.state);
		delete state.scales;

		history.pushState(
			"",
			"KeyWheel",
			`?q=${encodeURIComponent(JSON.stringify(state))}`
		);

		// copy to clipboard
		onCopyToClipboard(window.location.href);
	};

	calculateChord(i) {
		const { noteNames, chordNames } = this.state;
		const rootIdx = NOTE_NAMES.indexOf(noteNames[i]);
		const pegs = SHAPES[chordNames[i]]
			.map(note => (note + rootIdx) % 12)
			.sort();
		this.handleGroup(getNotes(pegs), i);
	}

	onNameChange = (e, i) => {
		const noteNames = dup(this.state.noteNames);
		noteNames[i] = e.target.value;
		this.setState({ noteNames }, () => this.calculateChord(i));
	}

	onChordChange = (e, i) => {
		const chordNames = dup(this.state.chordNames);
		chordNames[i] = e.target.value;
		this.setState({ chordNames }, () => this.calculateChord(i));
	}

	handleKeyPress = e => {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			this.shiftScale(2);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			this.shiftScale(-2);
		}
	};

	rebuildKeyWheel = () => {
		const newStart = nodeFromRoot(this.state.start);
		const flip = this.state.start > 6 ? -1 : 1;
		const scales = buildKeyWheel(newStart, flip);
		this.setState({ scales });
	};

	shiftScale = inc => {
		const start = mod(this.state.start + inc, 12);
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
		const {
			selected,
			scales,
			mute,
			mode,
			rootReference,
			ordering,
		} = this.state;

		if (!scales) return null;

		return (
			<div style={mainStyle}>
				<div style={navBarStyle}>
					<div style={titleStyle}>KeyWheel</div>
					<div style={linkContainerStyle}>
						<button style={buttonStyle} onClick={this.onSaveToClipboard}>
							Save To Clipboard
						</button>
						<button style={buttonStyle} onClick={this.toggleMute}>
							{this.state.mute ? "Unmute" : "Mute"}
						</button>
						<button style={buttonStyle} onClick={this.clearNotes}>
							Clear All
						</button>
						<select
							onChange={this.changeRef}
							style={buttonStyle}
							defaultValue={"numbers"}
						>
							{Object.keys(ROOT_REFERENCES).map((key, i) => (
								<option key={`reference-${i}`} value={key}>
									Label: {ROOT_REFERENCES[key]}
								</option>
							))}
						</select>
						<select
							onChange={this.changeOrder}
							style={buttonStyle}
							defaultValue={"chromatic"}
						>
							{Object.keys(ORDERINGS).map((key, i) => (
								<option key={`ordering-${i}`} value={key}>
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
				</div>

				<div style={{ margin: "50px auto", width: "fit-content" }}>
					<Input
						selected={selected}
						handleClick={this.handleClick}
						handleGroup={this.handleGroup}
						onNameChange={this.onNameChange}
						onChordChange={this.onChordChange}
						clearNotes={this.clearNotes}
						rootReference={rootReference}
						mode={mode}
						mute={mute}
						ordering={ordering}
					/>
				</div>

				<div style={{ margin: "50px auto", width: "fit-content" }}>
					<KeyWheel
						selected={selected}
						scales={scales}
						rootReference={rootReference}
						mode={mode}
						mute={mute}
						ordering={ordering}
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
