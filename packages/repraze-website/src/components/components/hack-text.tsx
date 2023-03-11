import {Random} from "@repraze/lib-utils/random";
import React, {useEffect, useState} from "react";

// import classnames from "classnames";

export interface HackTextProps {
    text?: string;
}

const HACK_CHARACTERS = "ABCDEF0123456789_#$".split("");
const rng = Random.default();

function generateHackText(text: string, chaos: number): string {
    if (chaos <= 0) {
        return text;
    }
    return text
        .split("")
        .map((c) => (rng.float(0, 1) < chaos ? `<span class="text-primary">${rng.item(HACK_CHARACTERS)}</span>` : c))
        .join("");
}

function generateHackTextPosition(text: string, chaos: number): string {
    const len = text.length;
    if (chaos <= 0 || len === 0) {
        return text;
    }
    return text
        .split("")
        .map((c, p) => ((len - p) / (len + 1) <= chaos ? rng.item(HACK_CHARACTERS) : c))
        .join("");
}

function generateHackTextPositionSpace(text: string, chaos: number): string {
    const len = text.length;
    if (chaos <= 0 || len === 0) {
        return text;
    }
    return text
        .split("")
        .map((c, p) => (c != " " ? ((len - p) / (len + 1) <= chaos ? rng.item(HACK_CHARACTERS) : c) : " "))
        .join("");
}

function generateHackText2(text: string, chaos: number): string {
    const len = text.length;
    if (chaos <= 0 || len === 0) {
        return text;
    }
    return text
        .split("")
        .map((c, p) => {
            if ((len - p) / (len + 1) <= chaos) {
                if ((len - p + 2) / (len + 1) <= chaos) {
                    return "";
                } else {
                    return rng.item(HACK_CHARACTERS);
                }
            } else {
                return c;
            }
        })
        .join("");
}

export function HackText({text}: HackTextProps) {
    // const textRef = useRef<HTMLSpanElement>(null);
    const duration = 1000 * 0.5; //ms
    const stepDuration = 40; //ms
    const [displayText, setDisplayText] = useState<string>(text || "");
    // const baseText = children ? generateHackTextPositionSpace(children, 1) : "";
    useEffect(() => {
        let running = true;
        let previous = Date.now();
        let completed = 0;
        let ratioCompleted = 0;
        let lastStep = 0;
        function animate(time: number) {
            if (running) {
                const now = Date.now();
                const delta = now - previous;
                previous = now;

                completed = completed + delta;
                ratioCompleted = completed / duration;

                // const textElement = textRef.current;
                // throttle animation
                if (completed >= lastStep + stepDuration) {
                    lastStep = completed;

                    // if (textElement !== null && children !== undefined) {
                    //     textElement.innerHTML = generateHackTextPositionSpace(children, 1 - ratioCompleted);
                    // }
                    setDisplayText(generateHackTextPositionSpace(text || "", 1 - ratioCompleted));
                }

                if (ratioCompleted < 1) {
                    window.requestAnimationFrame(animate);
                } else {
                    running = false;
                    // end frame
                    // if (textElement !== null && children !== undefined) {
                    //     textElement.innerHTML = children;
                    // }
                    setDisplayText(text || "");
                }
            }
        }
        window.requestAnimationFrame(animate);
        return () => {
            running = false;
        };
    }, [text, duration]);

    return <>{displayText}</>;
}
