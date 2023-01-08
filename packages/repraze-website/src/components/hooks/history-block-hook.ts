import {useCallback, useEffect, useRef} from "react";
import {useHistory} from "react-router-dom";

export interface UseHistoryBlockParams {
    condition: () => boolean;
    onBlock?: (next: () => void) => void;
}

export function useHistoryBlock({condition, onBlock}: UseHistoryBlockParams) {
    const history = useHistory();
    const unblockRef = useRef<() => void>(() => undefined);

    // unblock to allow routing and skip condition
    const handleUnblock = useCallback(() => {
        unblockRef.current();
    }, []);

    useEffect(() => {
        unblockRef.current = history.block((location) => {
            if (condition()) {
                const pathname = location.pathname;

                if (onBlock) {
                    onBlock(() => {
                        unblockRef.current();
                        history.push(pathname);
                    });
                }

                return false; // block
            }
        });

        return () => {
            unblockRef.current();
        };
    }, [history, condition]);

    return {unblock: handleUnblock};
}
