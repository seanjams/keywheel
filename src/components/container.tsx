import * as React from "react";
import { App } from "./app";
import { AppStore } from "../store/state";
import { useMemo } from "react";

export const Container: React.FC = () => {
    const appStore = useMemo(() => new AppStore(), []);
    return <App appStore={appStore} />;
};
