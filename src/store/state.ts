import { DEFAULT_APP_STATE, reducers } from "./reducers";
import { Store } from "./store";
import { AppStateType } from "./types";

// Store
export class AppStore extends Store<AppStateType, typeof reducers> {
    constructor() {
        super(DEFAULT_APP_STATE(), reducers);
    }
}
