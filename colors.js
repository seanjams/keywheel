export const darkGrey = "#333";

export const grey = "#BBB";

export const offWhite = "#EEE";

export const gold = "gold";

export const brown = "brown";

export const transparent = "transparent";

export const COLORS = opacity => [
	`rgba(255,100,100,${opacity})`,
	`rgba(100,100,255,${opacity})`,
	`rgba(255,0,155,${opacity})`,
	`rgba(255,100,0,${opacity})`,
	`rgba(0,155,0,${opacity})`,
	`rgba(155,0,255,${opacity})`,
	`rgba(255,155,0,${opacity})`,
	`rgba(0,155,100,${opacity})`,
	`rgba(255,255,0,${opacity})`,
];

export const INTERVAL_COLORS = [
	`rgba(50,50,255,1)`,
	`rgba(255,0,155,1)`,
	`rgba(255,100,0,1)`,
	`rgba(0,155,0,1)`,
	`rgba(155,0,255,1)`,
	`rgba(255,155,0,1)`,
];

export const CHORD_COLOR = {
	major: "rgba(100,100,255,0.5)",
	minor: "rgba(255,100,100,0.5)",
	major7: "rgba(155,0,255,0.5)",
	minor7: "rgba(255,0,155,0.5)",
	dom: "rgba(255,100,0,0.5)",
	dom5: "rgba(255,100,0,0.5)",
	dom9: "rgba(255,155,0,0.5)",
	dim: "rgba(100,255,100,0.5)",
	dimbb7: "rgba(0,155,0,0.5)",
	dimb7: "rgba(0,255,0,0.5)",
	sus2: "rgba(255,255,0,0.5)",
	sus4: "rgba(255,255,0,0.5)",
	pentatonic: "rgba(255,0,0,0.5)",
	dimPentatonic: "rgba(0,200,0,0.5)",
};
