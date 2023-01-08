export interface EventEmitterEvents {
    [key: string]: any;
}

interface EventEmitterListener<V extends Array<any>> {
    callback: (...value: V) => void;
    once: boolean;
    next?: EventEmitterListener<V>;
}

interface EventEmitterListenerList<V extends Array<any>> {
    first: EventEmitterListener<V>;
    last: EventEmitterListener<V>;
}

export class EventEmitter<T extends EventEmitterEvents> {
    private listenersMap: {[K in keyof T]?: EventEmitterListenerList<T[K]>};

    constructor() {
        this.listenersMap = {};
    }

    on<K extends keyof T>(name: K, callback: (...value: T[K]) => void): this {
        const listener = {
            callback,
            once: false,
        };

        const listeners = this.listenersMap[name];
        if (listeners === undefined) {
            this.listenersMap[name] = {
                first: listener,
                last: listener,
            };
        } else {
            listeners.last.next = listener;
            listeners.last = listener;
        }

        return this;
    }

    once<K extends keyof T>(name: K, callback: (...value: T[K]) => void): this {
        const listener = {
            callback,
            once: true,
        };

        const listeners = this.listenersMap[name];
        if (listeners === undefined) {
            this.listenersMap[name] = {
                first: listener,
                last: listener,
            };
        } else {
            listeners.last.next = listener;
            listeners.last = listener;
        }

        return this;
    }

    off<K extends keyof T>(name: K, callback: (...value: T[K]) => void): this {
        const listeners = this.listenersMap[name];
        if (listeners !== undefined) {
            let prev: EventEmitterListener<T[K]> | undefined = undefined;
            let curr: EventEmitterListener<T[K]> | undefined = listeners.first;
            while (curr !== undefined) {
                if (curr.callback === callback) {
                    if (prev) {
                        // mid and last position
                        prev.next = curr.next;
                    } else if (curr.next) {
                        // first position
                        listeners.first = curr.next;
                    } else {
                        // last left, remove list
                        delete this.listenersMap[name];
                    }
                }

                prev = curr;
                curr = curr.next;
            }
        }
        return this;
    }

    emit<K extends keyof T>(name: K, ...value: T[K]) {
        const listeners = this.listenersMap[name];

        if (listeners !== undefined) {
            let prev: EventEmitterListener<T[K]> | undefined = undefined;
            let curr: EventEmitterListener<T[K]> | undefined = listeners.first;
            while (curr !== undefined) {
                curr.callback(...value);
                if (curr.once) {
                    // remove on once
                    if (prev) {
                        // mid and last position
                        prev.next = curr.next;
                    } else if (curr.next) {
                        // first position
                        listeners.first = curr.next;
                    } else {
                        // last left, remove list
                        delete this.listenersMap[name];
                    }
                }

                prev = curr;
                curr = curr.next;
            }
        }
    }
}
