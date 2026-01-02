import * as React from "react";
import { App } from "./app";
import { AppStore } from "../store2/state";
import { useMemo } from "react";

interface ContainerProps {
    oldState: {};
    appStore: AppStore;
}

export const Container: React.FC<ContainerProps> = ({ appStore, oldState }) => {
    return <App oldState={oldState} appStore={appStore} />;
};
