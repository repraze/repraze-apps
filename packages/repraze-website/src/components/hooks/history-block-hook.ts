import {useRouter} from "next/router";
import {useCallback, useEffect, useRef} from "react";

export interface UseHistoryBlockParams {
    condition: () => boolean;
    onBlock?: (next: () => void) => void;
}

export function useHistoryBlock_old({condition, onBlock}: UseHistoryBlockParams) {
    const router = useRouter();
    const unblockRef = useRef<() => void>(() => undefined);

    // unblock to allow routing and skip condition
    const handleUnblock = useCallback(() => {
        unblockRef.current();
    }, []);

    useEffect(() => {
        unblockRef.current = router.block((location) => {
            if (condition()) {
                const pathname = location.pathname;

                if (onBlock) {
                    onBlock(() => {
                        unblockRef.current();
                        router.push(pathname);
                    });
                }

                return false; // block
            }
        });

        return () => {
            unblockRef.current();
        };
    }, [condition, router, onBlock]);

    return {unblock: handleUnblock};
}

export function useHistoryBlock({condition, onBlock}: UseHistoryBlockParams) {
    const router = useRouter();
    const unblockRef = useRef<boolean>(false);

    // unblock to allow routing and skip condition
    const handleUnblock = useCallback(() => {
        unblockRef.current = true;
    }, []);

    useEffect(() => {
        function routeChangeStartHandler(route: string) {
            console.log(route, arguments);

            if (!unblockRef.current && condition()) {
                if (onBlock) {
                    onBlock(() => {
                        handleUnblock();
                        router.push(route);
                    });
                }

                // block change
                router.events.emit("routeChangeError");
                throw "routeChange aborted.";
            }
        }

        router.events.on("routeChangeStart", routeChangeStartHandler);

        return () => {
            router.events.off("routeChangeStart", routeChangeStartHandler);
        };
    }, [condition, router, onBlock, handleUnblock]);

    return {unblock: handleUnblock};
}
