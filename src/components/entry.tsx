import * as React from "react";
import ReactDOM from "react-dom/client";
import { Container } from "./container";
import { KeyCube } from "./keycube";
import "../css/reset.css";
import "../css/static.css";
import { AppStore } from "../store2/state";

document.addEventListener("DOMContentLoaded", () => {
    const rootDiv = document.createElement("div");
    rootDiv.setAttribute("id", "root");

    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1";

    document.body.appendChild(rootDiv);
    document.head.appendChild(meta);

    const root = ReactDOM.createRoot(rootDiv);

    const appStore = new AppStore();

    try {
        let oldState = JSON.parse(
            decodeURIComponent(window.location.search.slice(3)),
        );
        root.render(<Container appStore={appStore} oldState={oldState} />);
    } catch (e) {
        console.warn("Unable to parse state from url, resorting to default", e);
        root.render(<Container appStore={appStore} oldState={{}} />);
    }
});
