import * as React from "react";
import { DEFAULT_STATE, reducer, KeyWheelContext } from "../store";
import { App } from "./app";

export const Container = ({}) => {
    const [state, dispatch] = React.useReducer(reducer, DEFAULT_STATE);

    return (
        <KeyWheelContext.Provider value={{ state, dispatch }}>
            <App />
        </KeyWheelContext.Provider>
    );
};
