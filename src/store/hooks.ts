import { useEffect, useState, useRef, useCallback } from "react";
import { ReactMouseEvent, WindowMouseEvent } from "../types";
import { AnyReducersType, Store } from "./store";
// import { AudioStore } from "./AudioStore";
// import { TimedEffectStore } from "./TimedEffectStore";

function shouldUpdate<S>(currentState: S, newState: Partial<S>) {
    return Object.keys(newState).some((key) => {
        const prop = key as keyof typeof newState;
        return currentState[prop] !== newState[prop];
    });
}

export function useDerivedState<S, R extends AnyReducersType<S>, T>(
    store: Store<S, R>,
    deriveStateFromStore: (appState: S, componentState: Partial<T>) => T,
): [() => T, React.Dispatch<React.SetStateAction<Partial<T>>>] {
    const defaultComponentState = {} as T;
    const defaultState = deriveStateFromStore(
        store.state,
        defaultComponentState,
    );
    const [state, _setState] = useState(defaultState);
    const stateRef = useRef(state);
    stateRef.current = state;
    const getState = () => stateRef.current;
    const setState = (newState: Partial<T>) => {
        _setState((prevState) => ({ ...prevState, ...newState }));
    };

    useEffect(
        () =>
            store.addListener((appState: S) => {
                const derivedState = deriveStateFromStore(
                    appState,
                    stateRef.current,
                );
                if (shouldUpdate(stateRef.current, derivedState))
                    setState(derivedState);
            }),
        [],
    );

    return [getState, setState];
}

export function useWindowListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions | undefined,
) {
    useEffect(() => {
        window.addEventListener(type, listener, options);
        return () => {
            window.removeEventListener(type, listener, options);
        };
    }, []);
}

export const useKeyPressHandlers = (
    onStart?: (event: KeyboardEvent) => void,
    onEnd?: (event: KeyboardEvent) => void,
) => {
    const isPressedRef = useRef(false);

    const start = useCallback(
        (event: KeyboardEvent) => {
            // set isPressed
            isPressedRef.current = true;

            // call handler
            if (onStart) onStart(event);
        },
        [onStart],
    );

    const clear = useCallback(
        (event: KeyboardEvent) => {
            if (!isPressedRef.current) return;
            // set isPressed
            isPressedRef.current = false;

            // call handler
            if (onEnd) onEnd(event);
        },
        [onEnd],
    );

    // handlers
    const onKeyDown = (event: KeyboardEvent) => start(event);
    const onKeyUp = (event: KeyboardEvent) => clear(event);

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    return {
        onKeyDown,
        onKeyUp,
    };
};

export interface TouchStateType {
    isDragging: boolean;
    isPressed: boolean;
    isPendingDoubleClick: boolean;
    isLongPress: boolean;
    longPressTimeout: ReturnType<typeof setTimeout> | null;
    isExtraLongPress: boolean;
    extraLongPressTimeout: ReturnType<typeof setTimeout> | null;
    origin: [number, number] | null; // where touch was initiated
    coordinates: [number, number] | null; // current touch location
    isWithinThreshold: boolean;
}

export function getCoordinates(
    event: ReactMouseEvent | WindowMouseEvent,
): [number, number] | null {
    let clientX: number;
    let clientY: number;
    if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
    } else if (event instanceof TouchEvent) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        return null;
    }

    return [clientX, clientY];
}

export const useTouchHandlers = (
    handlers: {
        onStart?: (event: ReactMouseEvent, touchStore: TouchStateType) => void;
        onClick?: (event: WindowMouseEvent, touchStore: TouchStateType) => void;
        onEnd?: (event: WindowMouseEvent, touchStore: TouchStateType) => void;
        onMove?: (event: WindowMouseEvent, touchStore: TouchStateType) => void;
        onDoubleClick?: (
            event: WindowMouseEvent,
            touchStore: TouchStateType,
        ) => void;
        onLongPress?: (
            event: ReactMouseEvent,
            touchStore: TouchStateType,
        ) => void;
        onExtraLongPress?: (
            event: ReactMouseEvent,
            touchStore: TouchStateType,
        ) => void;
    },
    {
        extraLongPressDelay = 1200,
        longPressDelay = 600,
        doubleClickDelay = 600,
        threshold = 10,
    } = {},
) => {
    const {
        onStart,
        onClick,
        onEnd,
        onMove,
        onDoubleClick,
        onLongPress,
        onExtraLongPress,
    } = handlers;

    const touchStoreRef = useRef<TouchStateType>({
        isDragging: false,
        isPressed: false,
        isPendingDoubleClick: false,
        isLongPress: false,
        longPressTimeout: null,
        isExtraLongPress: false,
        extraLongPressTimeout: null,
        origin: null,
        coordinates: null,
        isWithinThreshold: false,
    });

    const start = useCallback(
        (event: ReactMouseEvent) => {
            // set isPressed
            touchStoreRef.current.isPressed = true;

            // set press origin, coordinates
            const origin = (touchStoreRef.current.origin =
                getCoordinates(event));
            touchStoreRef.current.coordinates = origin;
            touchStoreRef.current.isWithinThreshold = true;

            // if there is a double click handler,
            // set isPendingDoubleClick on first click,
            // and start timeout to change it back to false.
            // otherwise set isPendingDoubleClick to false
            // and trigger handler in clear().
            if (onDoubleClick) {
                if (touchStoreRef.current.isPendingDoubleClick) {
                    touchStoreRef.current.isPendingDoubleClick = false;
                } else {
                    // set timeout for double click
                    touchStoreRef.current.isPendingDoubleClick = true;
                    setTimeout(() => {
                        touchStoreRef.current.isPendingDoubleClick = false;
                    }, doubleClickDelay);
                }
            }

            // set timeout for long press
            touchStoreRef.current.isLongPress = false;
            touchStoreRef.current.longPressTimeout = setTimeout(() => {
                touchStoreRef.current.isLongPress = true;
                if (onLongPress) {
                    onLongPress(event, touchStoreRef.current);
                }
            }, longPressDelay);

            // set timeout for extra long press
            touchStoreRef.current.isExtraLongPress = false;
            touchStoreRef.current.extraLongPressTimeout = setTimeout(() => {
                touchStoreRef.current.isExtraLongPress = true;
                if (onExtraLongPress) {
                    onExtraLongPress(event, touchStoreRef.current);
                }
            }, extraLongPressDelay);

            // call start handler (not click, which happens in clear)
            if (onStart) onStart(event, touchStoreRef.current);
        },
        [
            onDoubleClick,
            onStart,
            onLongPress,
            onExtraLongPress,
            doubleClickDelay,
            longPressDelay,
            extraLongPressDelay,
        ],
    );

    const move = useCallback(
        (event: WindowMouseEvent) => {
            // set isDragging
            const {
                isPressed,
                isDragging,
                longPressTimeout,
                extraLongPressTimeout,
                isWithinThreshold,
            } = touchStoreRef.current;
            let origin = touchStoreRef.current?.origin;

            if (isPressed && !isDragging) {
                touchStoreRef.current.isDragging = true;
            }
            // else if (!isPressed) {
            //     // for window events
            //     touchStoreRef.current.isDragging = false;
            // }

            // set coordinates if entering this component from drag
            const coordinates = (touchStoreRef.current.coordinates =
                getCoordinates(event));
            if (!origin) origin = touchStoreRef.current.origin = coordinates;

            // check if moved outside of boundary
            if (coordinates && origin && isPressed) {
                // set isWithinThreshold by checking current location hypotenuse length
                const [x0, y0] = origin;
                const [x1, y1] = coordinates;

                const newIsWithinThreshold =
                    (x1 - x0) ** 2 + (y1 - y0) ** 2 < threshold ** 2;

                // set isLongPress and isExtraLongPress
                if (isWithinThreshold && !newIsWithinThreshold) {
                    // isLongPress
                    if (longPressTimeout) {
                        clearTimeout(longPressTimeout);
                        touchStoreRef.current.longPressTimeout = null;
                    }
                    touchStoreRef.current.isLongPress = false;
                    // isExtraLongPress
                    if (extraLongPressTimeout) {
                        clearTimeout(extraLongPressTimeout);
                        touchStoreRef.current.extraLongPressTimeout = null;
                    }
                    touchStoreRef.current.isExtraLongPress = false;
                }

                touchStoreRef.current.isWithinThreshold = newIsWithinThreshold;
            }

            if (onMove)
                // call handler
                onMove(event, touchStoreRef.current);
        },
        [onMove],
    );

    const clear = useCallback(
        (event: WindowMouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const {
                isPressed,
                isLongPress,
                isExtraLongPress,
                longPressTimeout,
                extraLongPressTimeout,
                isWithinThreshold,
                isPendingDoubleClick,
            } = touchStoreRef.current;

            if (!isPressed) return;
            const shouldTriggerClick =
                isWithinThreshold && !isLongPress && !isExtraLongPress;
            // Call handler(s) before resetting touchStore.
            // The only way isPendingDoubleClick would be false here is if
            // there is a double click handler and we are on the second click,
            // within the delay time frame. In that case, we are going to call
            // double click handler instead of the single click handler.
            if (shouldTriggerClick) {
                if (onDoubleClick) {
                    if (isPendingDoubleClick) {
                        if (onClick) onClick(event, touchStoreRef.current);
                    } else {
                        onDoubleClick(event, touchStoreRef.current);
                    }
                } else {
                    if (onClick) onClick(event, touchStoreRef.current);
                }
            }
            if (onEnd) {
                onEnd(event, touchStoreRef.current);
            }

            // Reset touchStore

            // set isPressed
            touchStoreRef.current.isPressed = false;

            // set press coordinates
            touchStoreRef.current.origin = null;
            touchStoreRef.current.coordinates = null;
            touchStoreRef.current.isWithinThreshold = false;

            // set isDragging
            touchStoreRef.current.isDragging = false;

            // set isLongPress
            if (longPressTimeout) {
                clearTimeout(longPressTimeout);
                touchStoreRef.current.longPressTimeout = null;
            }
            touchStoreRef.current.isLongPress = false;

            // set isExtraLongPress
            if (extraLongPressTimeout) {
                clearTimeout(extraLongPressTimeout);
                touchStoreRef.current.extraLongPressTimeout = null;
            }
            touchStoreRef.current.isExtraLongPress = false;
        },
        [onClick, onEnd],
    );

    // handlers
    const onMouseDown = (event: ReactMouseEvent) => start(event);
    const onTouchStart = (event: ReactMouseEvent) => start(event);
    const onMouseMove = (event: WindowMouseEvent) => move(event);
    const onTouchMove = (event: WindowMouseEvent) => move(event);
    const onMouseUp = (event: WindowMouseEvent) => clear(event);
    const onTouchEnd = (event: WindowMouseEvent) => clear(event);

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onTouchEnd);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    return {
        onMouseDown,
        onTouchStart,
    };
};

export const useOrientationChange = (onChange?: (event: Event) => void) => {
    const orientationRef = useRef(screen?.orientation?.type);

    // handlers
    const onOrientationChange = useCallback(
        (event: Event) => {
            orientationRef.current = screen?.orientation?.type;
            if (onChange) onChange(event);
        },
        [onChange],
    );

    useEffect(() => {
        window.addEventListener("orientationchange", onOrientationChange);
        return () => {
            window.removeEventListener(
                "orientationchange",
                onOrientationChange,
            );
        };
    }, []);

    return () => orientationRef.current;
};

type SafeAreaType = [number, number, number, number];

export const useSafeArea: () => () => SafeAreaType = () => {
    const [safeArea, setSafeArea] = useState<SafeAreaType>([0, 0, 0, 0]);
    const safeAreaRef = useRef(safeArea);
    safeAreaRef.current = safeArea;
    const onOrientationChange = () => {
        const orientation = getOrientation();
        const computedStyle = window.getComputedStyle(document.documentElement);
        const safeAreaTop = parseInt(computedStyle.getPropertyValue("--sat"));
        const safeAreaBottom = parseInt(
            computedStyle.getPropertyValue("--sab"),
        );
        const safeAreaLeft = parseInt(computedStyle.getPropertyValue("--sal"));
        const safeAreaRight = parseInt(computedStyle.getPropertyValue("--sar"));

        const safeArea: SafeAreaType = [safeAreaTop, safeAreaBottom, 0, 0];

        if (orientation === "landscape-primary") {
            safeArea[2] = safeAreaLeft;
        } else if (orientation === "landscape-secondary") {
            safeArea[3] = safeAreaRight;
        }
        setSafeArea(safeArea);
    };

    useEffect(() => {
        onOrientationChange();
    }, []);

    const getOrientation = useOrientationChange(onOrientationChange);

    return () => safeAreaRef.current;
};

// Hook which runs requestAnimationFrame for the specified duration length,
// and runs a callback on every frame for components to update style.
// - callback: (progress: number between 0 and 1) => void
// export const useTimedEffect = (
//     timedEffectStore: TimedEffectStore | AudioStore,
//     effectKey: string,
//     callback: (progress: number) => void,
//     complete: () => void = () => null,
// ) => {
//     const progressRef = useRef(1);
//     const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();

//     function timedEffectAnimation(duration: number) {
//         const totalFrames = Math.ceil(duration * 60);
//         // this is working better in the browser? What gives
//         // const totalFrames = Math.ceil(duration * 30);
//         let frameCount = 0;

//         const performAnimation = () => {
//             animationRef.current = requestAnimationFrame(performAnimation);

//             progressRef.current += 1 / totalFrames;
//             frameCount++;
//             // can stop animation early by removing key from activeEffects
//             // which sets progressRef to 1
//             const isComplete =
//                 frameCount === totalFrames || progressRef.current >= 1;

//             if (isComplete) progressRef.current = 1;

//             callback(progressRef.current);

//             if (isComplete) {
//                 cancelAnimationFrame(animationRef.current);
//                 timedEffectStore.dispatch.setIsEffectPlaying(effectKey, false);
//                 complete && complete();
//             }
//         };
//         requestAnimationFrame(performAnimation);
//     }

//     useEffect(
//         () =>
//             timedEffectStore.addListener(({ activeEffects, duration }) => {
//                 if (activeEffects.has(effectKey) && progressRef.current === 1) {
//                     // start animation if not currently in progress
//                     progressRef.current = 0;
//                     timedEffectAnimation(duration);
//                 } else if (
//                     !activeEffects.has(effectKey) &&
//                     progressRef.current !== 1
//                 ) {
//                     // stop animation if cancelled in store
//                     progressRef.current = 1;
//                 }
//             }),
//         [effectKey],
//     );
// };

// export const useIsMounted = () => {
//     const isMountedRef = useRef(true);
//     const isMounted = useCallback(() => isMountedRef.current, []);

//     useEffect(() => {
//         // return () => void (isMountedRef.current = false);
//         return () => {
//             isMountedRef.current = false;
//         };
//     }, []);

//     return isMounted;
// };
