import React from "react";
import { EMPTY, NOTE_NAMES } from "../consts";
import { COLORS, offWhite } from "../colors";
import { rotate } from "../util";

class FretBoard extends React.Component {
	getLabelColors() {
		const selectedDict = {};
		const result = {};
		NOTE_NAMES.forEach(name => {
			selectedDict[name] = [];
		});

		this.props.selected.forEach((notes, i) => {
			notes.forEach((note, j) => {
				if (note) selectedDict[NOTE_NAMES[j]].push(i);
			});
		});

		NOTE_NAMES.forEach(name => {
			const colors = selectedDict[name].map(i => COLORS(1)[i]);

			if (colors.length > 1) {
				let stripes = [];
				for (let i = 0; i < colors.length; i++) {
					stripes.push(`${colors[i]} ${100 * i / colors.length}%`);
					if (colors[i + 1])
						stripes.push(`${colors[i]} ${100 * (i + 1) / colors.length}%`);
				}

				stripes.join(", ");

				result[name] = {
					background: `linear-gradient(45deg, ${stripes})`,
					color: offWhite,
				};
			} else if (colors.length === 1) {
				result[name] = {
					background: colors[0],
					color: offWhite,
				};
			} else {
				result[name] = {
					background: "#ccc",
					color: "#444",
				};
			}
		});

		return result;
	}

	fretComponents() {
		const fretDivs = [];
		const colors = this.getLabelColors();
		const eString = rotate([...NOTE_NAMES], 5);

		const strings = Array(6)
			.fill(0)
			.map((_, i) => {
				const times = i > 3 ? 5 * i - 1 : 5 * i;
				let string = rotate([...eString], times);
				string = string.concat(string.slice(0, 4));
				return string;
			})
			.reverse();

		strings.forEach((noteNames, i) => {
			noteNames.forEach((name, j) => {
				const fretStyle = {
					boxShadow: "0px 0px 0px 2px #333",
					height: "100%",
					color: colors[name].color,
					background: colors[name].background,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				};

				fretDivs.push(
					<div key={noteNames.length * i + j} style={fretStyle}>
						{name}
					</div>
				);
			});
		});

		return fretDivs;
	}

	render() {
		const style = Object.assign({}, this.props.style, {
			position: "relative",
			display: "grid",
			gridTemplateColumns: "repeat(16, 1fr)",
		});

		const fretDivs = this.fretComponents();

		// const svgContainerStyle = {
		// 	position: "absolute",
		// 	height: "100%",
		// 	width: "100%",
		// 	zIndex: 50,
		// 	top: 0,
		// 	left: 0,
		// };

		// const lineStyle = {
		// 	stroke: "red",
		// 	strokeWidth: "1",
		// };

		return (
			<div style={style}>
				{/* <div style={svgContainerStyle}>
					<svg width="100%" height="100%" viewBox="0 0 1600 200">
						<polyline style={lineStyle} />
					</svg>
				</div> */}
				{fretDivs}
			</div>
		);
	}
}

export default FretBoard;
