export class ApiError extends Error {
    code: number;
    url: string;
    constructor(message: string, code = 500, url = "") {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.url = url;
    }
}
