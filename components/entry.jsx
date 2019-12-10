import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import "../css/reset.css";
import "../css/static.css";

document.addEventListener("DOMContentLoaded", () => {
	const root = document.createElement("div");
	root.setAttribute("id", "root");

	const meta = document.createElement("meta");
	meta.name = "viewport";
	meta.content = "width=device-width, initial-scale=1";

	document.body.appendChild(root);
	document.head.appendChild(meta);

	try {
		let state = JSON.parse(decodeURIComponent(window.location.search.slice(3)));
		ReactDOM.render(<App state={state} />, root);
	} catch (e) {
		console.warn("Unable to parse state from url, resorting to default", e);
		ReactDOM.render(<App />, root);
	}
});
