import chalk, {Chalk} from "chalk";

export enum LoggerLevel {
    TRACE = "trace",
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal",
}

const LEVEL_ORDER: {[level in LoggerLevel]: number} = {
    [LoggerLevel.TRACE]: 0,
    [LoggerLevel.DEBUG]: 1,
    [LoggerLevel.INFO]: 2,
    [LoggerLevel.WARN]: 3,
    [LoggerLevel.ERROR]: 4,
    [LoggerLevel.FATAL]: 5,
};

interface LoggerFormatInput {
    level: LoggerLevel;
    messages: any[];
    timestamp: Date;
}

export interface LoggerFormat {
    format: (input: LoggerFormatInput) => string;
}
export interface LoggerTransport {
    log: (output: string) => void;
}

export interface LoggerParams {
    level: LoggerLevel;
    format?: LoggerFormat;
    transports?: LoggerTransport[];
}

type LevelFn = (...data: any[]) => void;

export class Logger {
    trace: LevelFn;
    debug: LevelFn;
    info: LevelFn;
    warn: LevelFn;
    error: LevelFn;
    fatal: LevelFn;

    constructor({level, format = new TextFormat(), transports = [new ConsoleTransport()]}: LoggerParams) {
        const loggerLevel = LEVEL_ORDER[level];

        function createLevel(level: LoggerLevel): LevelFn {
            if (LEVEL_ORDER[level] >= loggerLevel) {
                return (...messages) => {
                    const output = format.format({level, messages, timestamp: new Date()});
                    transports.forEach((t) => t.log(output));
                };
            } else {
                return () => {};
            }
        }

        this.trace = createLevel(LoggerLevel.TRACE);
        this.debug = createLevel(LoggerLevel.DEBUG);
        this.info = createLevel(LoggerLevel.INFO);
        this.warn = createLevel(LoggerLevel.WARN);
        this.error = createLevel(LoggerLevel.ERROR);
        this.fatal = createLevel(LoggerLevel.FATAL);
    }
}

export class ConsoleTransport implements LoggerTransport {
    private logger: (...data: any[]) => void;
    constructor(logger = console.log) {
        this.logger = logger;
    }
    log(output: string) {
        this.logger(output);
    }
}

// export class FileTransport implements LoggerTransport {
//     constructor(logger = console.log) {}
//     log() {}
// }

const LEVEL_COLOR: {[level in LoggerLevel]: Chalk} = {
    [LoggerLevel.TRACE]: chalk.white,
    [LoggerLevel.DEBUG]: chalk.gray,
    [LoggerLevel.INFO]: chalk.blue,
    [LoggerLevel.WARN]: chalk.yellow,
    [LoggerLevel.ERROR]: chalk.red,
    [LoggerLevel.FATAL]: chalk.magenta,
};

export class TextFormat implements LoggerFormat {
    format({level, messages, timestamp}: LoggerFormatInput) {
        function parse(...messages: any): string {
            const output: string[] = [];
            const params: string[] = [];

            function parseField(m: any): string {
                if (typeof m === "string") {
                    return `"${m}"`;
                }
                if (typeof m === "number") {
                    return m.toString();
                }
                if (typeof m === "boolean") {
                    return m ? "true" : "false";
                }
                return "" + m;
            }

            messages.forEach((m: any) => {
                if (typeof m === "object" && m !== null) {
                    for (const key in m) {
                        params.push(`${key}=${parseField(m[key])}`);
                    }
                } else {
                    output.push(m.toString());
                }
            });

            // join output
            let line = "";
            if (output.length > 0) {
                line += output.join(", ");
                if (params.length > 0) {
                    line += " ";
                }
            }
            if (params.length > 0) {
                line += params.join(", ");
            }
            return line;
        }
        return `[${timestamp.toISOString()}] ${LEVEL_COLOR[level](level.toUpperCase())} ${chalk.bold(
            parse(...messages)
        )}`;
    }
}

// export class JsonFormat implements LoggerFormat {
//     format: () => string;
// }
