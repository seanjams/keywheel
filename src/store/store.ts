/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyReducersType<S> = {
    [key: string]: (state: S, ...args: any[]) => S;
};

export type TupleRest<T extends unknown[]> = T extends [any, ...infer U]
    ? U
    : never;

export class Store<S, R extends AnyReducersType<S>> {
    dispatch: {
        [K in keyof R]: (...args: TupleRest<Parameters<R[K]>>) => void;
    };

    // set manually to include debug logs
    private verbose = false; // this one
    private excludeKeys: (string | number | symbol)[] = []; // this one

    constructor(
        public state: S,
        private reducers: R,
    ) {
        if (!reducers) return;
        const dispatch = {} as any;
        let key: keyof typeof reducers;
        for (key in reducers) {
            const k = key;
            dispatch[k] = (...args: any[]): S => {
                const reducer = reducers[k];
                if (reducer) {
                    const exclude = this.excludeKeys.includes(k); // this one
                    this.state = reducer.call(reducers, this.state, ...args);
                    if (this.verbose && !exclude) {
                        // this one
                        console.log(`(1) Action: ${String(k)}`);
                    }

                    this.emit();
                }
                return this.state;
            };
        }

        this.dispatch = dispatch;
    }

    public setState = (nextState: S) => {
        this.state = nextState;
        this.emit();
    };

    // generally should avoid this, used for slider currently
    public setKey = (key: keyof S, value: S[keyof S]) => {
        this.state[key] = value;
        this.emit();
    };

    public getState = () => {
        // maybe return json instead
        return this.state;
    };

    private listeners = new Set<(state: S) => void>();

    public addListener(fn: (state: S) => void): () => void {
        this.listeners.add(fn);
        const destroy = () => {
            this.listeners.delete(fn);
            return null;
        };
        return destroy;
    }

    private emit() {
        this.listeners.forEach((fn) => fn(this.state));
    }
}
