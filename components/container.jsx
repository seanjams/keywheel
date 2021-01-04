import * as React from "react";
import { DEFAULT_STATE, reducer, KeyWheelContext } from "../store";
import { App } from "./app";
import { KeyCube } from "./keycube";

export const Container = ({}) => {
    const [state, dispatch] = React.useReducer(reducer, DEFAULT_STATE);

    return (
        <KeyWheelContext.Provider value={{ state, dispatch }}>
            <App />
            <div style={{ margin: "50px auto", width: "fit-content" }}>
                {state.keyCubeVisible && <KeyCube />}
            </div>
        </KeyWheelContext.Provider>
    );
};
