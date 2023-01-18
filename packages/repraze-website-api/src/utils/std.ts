import {ZodError, z} from "zod";

export async function waitForInput() {
    return new Promise<string>((res, rej) => {
        process.stdin.once("data", (data) => {
            const str = data.toString().replace(/\r?\n$/, "");
            res(str);
        });
    });
}

export async function stdInput<Schema extends z.ZodString>(label: string, schema?: Schema) {
    while (true) {
        try {
            process.stdout.write(`${label}: `);
            const str = schema ? await schema.parseAsync(await waitForInput()) : await waitForInput();
            return str;
        } catch (e) {
            if (e instanceof ZodError) {
                const firstIssue = e.issues[0];
                console.error(`Bad input, "${label}": ${firstIssue.message}`);
            } else {
                throw e;
            }
        }
    }
}
