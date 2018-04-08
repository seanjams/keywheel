import React from "react";
import Scale from "./scale";
import { EMPTY, COLORS } from "./util";
import isEqual from "lodash/isEqual";

//make dynamically placed inputs later

const getX = i => {
	return i * 1.5 * window.innerWidth / 10 + 100;
};

const getY = i => {
	return [450, 575][i];
};

const node = [
	{
		notes: [...EMPTY],
		center: {
			x: getX(0),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(1),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(2),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(3),
			y: getY(0),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(0),
			y: getY(1),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(1),
			y: getY(1),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(2),
			y: getY(1),
		},
	},
	{
		notes: [...EMPTY],
		center: {
			x: getX(3),
			y: getY(1),
		},
	},
];

const Input = props => {
	const { selected } = props;
	return (
		<div>
			{selected.map((notes, i) => {
				return (
					<Scale
						key={i}
						node={node[i]}
						selected={[notes]}
						handleClick={k => props.handleClick(k, i)}
						rootReferenceEnabled={props.rootReferenceEnabled}
						isInput={true}
						colorIdx={i}
					/>
				);
			})}
		</div>
	);
};

export default Input;
